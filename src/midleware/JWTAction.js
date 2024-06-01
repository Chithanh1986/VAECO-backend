require("dotenv").config();
import jwt from "jsonwebtoken";

const nonSecurePaths = ['/login'];

const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;
    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN });
    } catch (error) {
        console.log(error)
    }
    return token;
}

const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;
    try {
        decoded = jwt.verify(token, key);
    } catch (error) {
        console.log(error)
    }
    return decoded;
}

const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

const checkUserJWT = (req, res, next) => {
    if (nonSecurePaths.includes(req.path)) return next();
    let cookies = req.cookies;

    if (cookies && cookies.jwt) {
        let decoded = verifyToken(cookies.jwt);
        if (decoded) {
            req.user = decoded;
            req.token = cookies.jwt;
            next();
        } else {
            return res.status(401).json({
                EC: -1,
                EM: 'Not authenticated',
                DT: ''
            })
        }
    } else {
        return res.status(401).json({
            EC: -1,
            EM: 'Not authenticated',
            DT: ''
        })
    }

}

const checkUserPermission = (req, res, next) => {
    if (nonSecurePaths.includes(req.path) || req.path === '/account') return next();
    if (req.user) {
        let vae_user = req.user.vae_user;
        let group = req.user.group;
        let currentUrl = req.path;
        if (!group || group.length === 0) {

            return res.status(403).json({
                EC: -1,
                EM: 'do not permission to access',
                DT: ''
            })
        } else {
            if (group === "admin") {
                next();
            } else {
                return res.status(403).json({
                    EC: -1,
                    EM: 'Do not permission to access',
                    DT: ''
                })
            }

        }
    } else {
        return res.status(401).json({
            EC: -1,
            EM: 'Not authenticated',
            DT: ''
        })
    }
}

module.exports = {
    createJWT, verifyToken, checkUserJWT, checkUserPermission
}