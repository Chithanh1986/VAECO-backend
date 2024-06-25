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

    let newuser = await db.Users.findOne({
        where: { id: 1 },
        attributes: ["id", "vae_user", "vae_id", "group"],
    })

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