import db from '../models/index';
import bcrypt from 'bcrypt';
import { createJWT } from '../midleware/JWTAction';
require("dotenv").config();

const salt = bcrypt.genSaltSync(10);

const hashPassword = (userPassword) => {
    let hashPassword = bcrypt.hashSync(userPassword, salt);
    return hashPassword;
}

const checkUserExist = async (newVae_user) => {
    let user = await db.Users.findOne({
        where: { vae_user: newVae_user }
    })

    if (user) { return true; }
    return false;
}

const checkUserIdExist = async (newVae_id) => {
    let user = await db.Users.findOne({
        where: { vae_id: newVae_id }
    })

    if (user) { return true; }
    return false;
}

const registerNewUser = async (rawUserData) => {
    try {
        //check user, id exist
        let isUserExist = await checkUserExist(rawUserData.vae_user);
        if (isUserExist === true) {
            return {
                EM: 'VAE user is already exist',
                EC: 1,
            }
        }

        let isIdExist = await checkUserIdExist(rawUserData.vae_id);
        if (isIdExist === true) {
            return {
                EM: 'VAE ID is already exist',
                EC: 1
            }
        }

        if (rawUserData.password && rawUserData.password.length < 4) {
            return {
                EM: 'Password must more than 3 letters',
                EC: 1
            }
        }

        // hash passwork
        let hashPass = hashPassword(rawUserData.password);

        // create new user
        await db.Users.create({
            vae_user: rawUserData.vae_user,
            vae_id: rawUserData.vae_id,
            password: hashPass,
            group: rawUserData.group
        })
        return {
            EM: 'user created sucessfully',
            EC: 0
        }
    } catch (e) {
        console.log(e)
        return {
            EM: 'something wrong in service',
            EC: -2
        }
    }
}

const checkPassword = (inputPassword, hassPassword) => {
    return bcrypt.compareSync(inputPassword, hassPassword); //true or false
}

const handleUserLogin = async (rawData) => {
    try {
        let user = await db.Users.findOne({
            where: { vae_user: rawData.vae_user }
        })
        if (user) {
            let isCorrectPassword = checkPassword(rawData.password, user.password);
            let payload = {
                vae_user: user.vae_user,
                group: user.group
            };
            let token = createJWT(payload);
            if (isCorrectPassword === true) {
                return {
                    EM: 'login ok',
                    EC: 0,
                    DT: {
                        access_token: token,
                        group: user.group,
                        vae_user: user.vae_user
                    }
                }
            }
            return {
                EM: 'VAE user/passwork is incorrect',
                EC: 1,
                DT: ''
            }
        }
    } catch (error) {
        console.log(error)
        return {
            EM: 'something wrong in service',
            EC: -2
        }
    }
}

const getAllUser = async () => {
    try {
        let users = await db.Users.findAll(
            {
                attributes: ["id", "vae_user", "vae_id", "group"],
                // order: [[vae_id]]
                // include: { model: db.Group, attributes: ["name"] },
                // raw: true,
                // nest: true
            }
        );
        if (users) {
            return {
                EM: 'get data sucess',
                EC: 0,
                DT: users
            }
        } else {
            return {
                EM: 'data empty',
                EC: 0,
                DT: []
            }
        }
    }
    catch (e) {
        console.log(e)
        return {
            EM: 'something wrong with service',
            EC: 1,
            DT: [],
        }
    }
}

const getUserWithPagination = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;
        let { count, rows } = await db.Users.findAndCountAll({
            offset: offset, //số item bỏ đi
            limit: limit, //số item muốn lấy
            attributes: ["id", "vae_user", "vae_id", "group"],
            // order: [[vae_id]]
            // include: { model: db.Group, attributes: ["name"] },
            // raw: true,
            // nest: true
        })

        let totalPages = Math.ceil(count / limit);
        let data = {
            totalRows: count,
            totalPages: totalPages,
            users: rows
        }

        return {
            EM: 'get users with pagination satis',
            EC: 0,
            DT: data,
        }
    } catch (error) {
        console.log(error)
        return {
            EM: 'something wrong with service',
            EC: 1,
            DT: [],
        }
    }
}

const updateUserInfo = async (data) => {
    try {
        let user = await db.Users.findOne({
            where: { id: data.userData.id } //biến data được truyền là obj userData{id, vae_user, vae_id, group}
        })
        // Update user
        if (user) {
            await db.Users.update(data.userData, { where: { id: data.userData.id } });
            return {
                EM: 'user updated sucessfully',
                EC: 0,
                DT: ''
            }
        } else {
            return {
                EM: 'user not found',
                EC: 2,
                DT: ''
            }
        }

    } catch (e) {
        console.log(e)
        return {
            EM: 'something wrong in service',
            EC: -2
        }
    }
}

const deleteUserInfo = async (id) => {
    try {
        let user = await db.Users.findOne({
            where: { id: id }
        })
        if (user) {
            await user.destroy()
            return {
                EM: 'delete user sucess',
                EC: 0,
                DT: [],
            }
        } else {
            return {
                EM: 'user not exist',
                EC: 2,
                DT: [],
            }
        }
    } catch (error) {
        console.log(error)
        return {
            EM: 'something wrong with service',
            EC: 1,
            DT: [],
        }
    }
}

const changePasswordInfo = async (data) => {
    try {
        let user = await db.Users.findOne({
            where: { vae_user: data.passwordData.vae_user } //biến data được truyền là obj userData{id, vae_user, vae_id, group}
        })

        // Update password
        if (user) {
            let isCorrectPassword = checkPassword(data.passwordData.oldPassword, user.password);
            if (isCorrectPassword) {
                let hashPass = hashPassword(data.passwordData.newPassword);
                await db.Users.update({ password: hashPass }, { where: { vae_user: data.passwordData.vae_user } });
                return {
                    EM: 'Password updated sucessfully',
                    EC: 0,
                    DT: ''
                }
            } else {
                return {
                    EM: 'Wrong password',
                    EC: 2,
                    DT: ''
                }
            }
        } else {
            return {
                EM: 'user not found',
                EC: 2,
                DT: ''
            }
        }

    } catch (e) {
        console.log(e)
        return {
            EM: 'something wrong in service',
            EC: -2
        }
    }
}

module.exports = {
    registerNewUser, handleUserLogin, getAllUser, updateUserInfo, deleteUserInfo, getUserWithPagination, changePasswordInfo
}