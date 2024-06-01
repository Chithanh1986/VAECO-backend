import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import bluebird from 'bluebird';
import db from '../models';
import { where } from 'sequelize';


const salt = bcrypt.genSaltSync(10);

const hashPassword = (userPassword) => {
    let hashPassword = bcrypt.hashSync(userPassword, salt);
    return hashPassword;
}

const createNewUser = async (vae_user, vae_id, password, group) => {
    let hashPass = hashPassword(password);

    await db.Users.create({
        vae_user: vae_user,
        vae_id: vae_id,
        password: hashPass,
        group: group
    })

}

const getUserList = async () => {
    //test relationships
    let newuser = await db.Users.findOne({
        where: { id: 1 },
        attributes: ["id", "vae_user", "vae_id", "group"],
        // include: { model: db.Group, attributes: ["name"] },
        // raw: true,
        // nest: true
    })

    // let roles = await db.Role.findAll({
    //     include: { model: db.Group, where: { id: 1 }, attributes: ["name"] },
    //     raw: true,
    //     nest: true
    // })
    // console.log('>>> check user data:', newuser)
    // console.log('check new role', roles)

    let users = [];
    users = await db.Users.findAll();
    return users;
}

const deleteUser = async (userId) => {
    await db.Users.destroy({
        where: { id: userId }
    })
}

const getUserById = async (id) => {
    let user = {};
    user = await db.Users.findOne({
        where: { id: id }
        //raw: true cũng convert được nhưng user không còn là sequelize obj
    })
    return user.get({ plain: true }); //convert từ sequelize obj sang java obj
}

const updateUserInfo = async (vae_user, vae_id, group, id) => {
    await db.Users.update(
        { vae_user: vae_user, vae_id: vae_id, group: group },
        { where: { id: id } }
    )
}

module.exports = {
    createNewUser, getUserList, deleteUser, getUserById, updateUserInfo
}