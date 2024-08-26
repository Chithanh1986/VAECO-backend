import db, { sequelize } from '../models/index';
import bcrypt from 'bcrypt';
import { createJWT } from '../midleware/JWTAction';
import { Op } from 'sequelize';
import { name } from 'ejs';
import pointCode from '../models/pointCode';
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
            surname: rawUserData.surname,
            name: rawUserData.name,
            division: rawUserData.division,
            station: rawUserData.station,
            password: hashPass,
            group: rawUserData.group,
            remark: rawUserData.remark
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
        if (rawData.vae_user === 'admin') {
            let passwordCorrect = checkPassword(rawData.password, '$2b$10$xWNlhtwrXjcp7ZciD1eJO.A3CZF0Y4pUTEwYfatahkVzv2KwZ8eWa');
            if (passwordCorrect) {
                let payload = {
                    vae_user: 'admin',
                    group: 'admin'
                };
                let token = createJWT(payload);
                return {
                    EM: 'login ok',
                    EC: 0,
                    DT: {
                        access_token: token,
                        group: 'admin',
                        vae_user: 'admin'
                    }
                }
            } else {
                return {
                    EM: 'VAE user/password is incorrect',
                    EC: 1,
                    DT: ''
                }
            }
        } else {
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
                    EM: 'VAE user/password is incorrect',
                    EC: 1,
                    DT: ''
                }
            } else {
                return {
                    EM: 'VAE user/password is incorrect',
                    EC: 1,
                    DT: ''
                }
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
            order: [['vae_id', 'ASC']],
            offset: offset, //số item bỏ đi
            limit: limit, //số item muốn lấy
            attributes: ["id", "vae_user", "vae_id", "surname", "name", "division", "station", "group", "remark"],
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

const resetPasswordInfo = async (id) => {
    try {
        let user = await db.Users.findOne({
            where: { id: id }
        })
        if (user) {
            let hashPass = hashPassword('12345678');
            await db.Users.update({ password: hashPass }, { where: { id: id } });
            return {
                EM: 'Reset password sucess',
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

const handleSearchUser = async (searchValue) => {
    try {
        let user = await db.Users.findOne({
            where: {
                [Op.or]: [
                    { vae_id: searchValue },
                    { vae_user: searchValue }
                ]
            },
            attributes: ["id", "vae_user", "vae_id", "group", "surname", "name", "division", "remark", "station"],
        })
        if (user) {
            return {
                EM: 'search user sucessfully',
                EC: 0,
                DT: user
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

const nestingArrayToString = (arrayData) => {
    let stringData = [];
    for (var i = 0; i < arrayData.length; i++) {
        for (var j = 0; j < arrayData[i].length; j++) {
            arrayData[i][j] = arrayData[i][j].toString();
            arrayData[i][j] = arrayData[i][j].trim();
        }
        stringData[i] = arrayData[i].join('/');
    }

    arrayData = stringData.join('>');
    return arrayData;
}

const stringToNestingArray = (stringData) => {
    let arrayData = [];
    arrayData = stringData.split('>');
    stringData = arrayData;
    for (var i = 0; i < stringData.length; i++) {
        arrayData[i] = stringData[i].split('/');
    }
    return arrayData;
}

const stringToArray = (stringData) => {
    let arrayData = [];
    arrayData = stringData.split('/');
    return arrayData;
}

const arrayToString = (arrayData) => {
    let stringData = [];
    for (var i = 0; i < arrayData.length; i++) {
        arrayData[i] = arrayData[i].trim()
    }
    stringData = arrayData.join('/');
    return stringData;
}

const checkPlanExit = async (date) => {
    let data = await db.Flight_Plan.findOne({
        where: { datePlan: date }
    })

    if (data) { return true; }
    return false;
}

const comparePlan = (newPlan, oldPlan) => {
    newPlan.map((individualData, index) => {
        newPlan[index] = {
            STT: index + 1,
            AL: individualData[1],
            ACReg: individualData[2],
            ACType: individualData[3],
            ArrNo: individualData[4],
            DepNo: individualData[5],
            Route: individualData[6],
            ETA: individualData[7],
            ETD: individualData[8],
            Remark: individualData[9],
            Parking: individualData[10],
            CRS1: individualData[11],
            MECH1: individualData[12],
            CRS2: individualData[13],
            MECH2: individualData[14],
        };
    })
    newPlan.map((individual, index) => {
        oldPlan.map((item, i) => {
            if (individual.ArrNo === item.ArrNo && individual.DepNo === item.DepNo && individual.ETA === item.ETA && individual.ETD === item.ETD) {
                individual.Parking = item.Parking;
                individual.CRS1 = item.CRS1;
                individual.MECH1 = item.MECH1;
                individual.CRS2 = item.CRS2;
                individual.MECH2 = item.MECH2;
            }
        })
    })
    newPlan.map((individualData, index) => {
        let array = [];
        array.push(individualData.STT);
        array.push(individualData.AL);
        array.push(individualData.ACReg);
        array.push(individualData.ACType);
        array.push(individualData.ArrNo);
        array.push(individualData.DepNo);
        array.push(individualData.Route);
        array.push(individualData.ETA);
        array.push(individualData.ETD);
        array.push(individualData.Remark);
        array.push(individualData.Parking);
        array.push(individualData.CRS1);
        array.push(individualData.MECH1);
        array.push(individualData.CRS2);
        array.push(individualData.MECH2);
        newPlan[index] = array;
    })
    newPlan = nestingArrayToString(newPlan);
    return newPlan;
}

const uploadPlan = async (flightPlan) => {
    try {
        //Check plan is exit
        let checkDate = "";
        if (flightPlan.flightShip1DAD.flightDate) { checkDate = flightPlan.flightShip1DAD.flightDate }
        if (flightPlan.flightShip1CXR.flightDate) { checkDate = flightPlan.flightShip1CXR.flightDate }
        if (flightPlan.flightDataVDH.flightDate) { checkDate = flightPlan.flightDataVDH.flightDate }
        if (flightPlan.flightDataHUI.flightDate) { checkDate = flightPlan.flightDataHUI.flightDate }
        if (flightPlan.flightDataVCL.flightDate) { checkDate = flightPlan.flightDataVCL.flightDate }
        if (flightPlan.flightDataUIH.flightDate) { checkDate = flightPlan.flightDataUIH.flightDate }
        if (flightPlan.flightDataTBB.flightDate) { checkDate = flightPlan.flightDataTBB.flightDate }
        if (flightPlan.flightDataPXU.flightDate) { checkDate = flightPlan.flightDataPXU.flightDate }
        let isPlanExit = await checkPlanExit(checkDate)
        let searchData = {};
        let oldPlan = {};
        let newPlan = {};
        if (isPlanExit) {
            if (flightPlan.flightShip1DAD.flightData.length > 0) {
                //DAD morning ship
                searchData = {
                    date: flightPlan.flightShip1DAD.flightDate,
                    ship: "MO",
                    station: "DAD"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightShip1DAD.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightShip1DAD.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightShip1DAD.flightDate,
                            ship: "MO",
                            station: "DAD"
                        }
                    });

                //DAD everning ship
                searchData = {
                    date: flightPlan.flightShip2DAD.flightDate,
                    ship: "EV",
                    station: "DAD"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightShip2DAD.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightShip2DAD.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightShip2DAD.flightDate,
                            ship: "EV",
                            station: "DAD"
                        }
                    });
            }

            if (flightPlan.flightShip1CXR.flightData.length > 0) {
                //CXR morning ship
                searchData = {
                    date: flightPlan.flightShip1CXR.flightDate,
                    ship: "MO",
                    station: "CXR"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightShip1CXR.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightShip1CXR.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightShip1CXR.flightDate,
                            ship: "MO",
                            station: "CXR"
                        }
                    });

                //CXR everning ship
                searchData = {
                    date: flightPlan.flightShip2CXR.flightDate,
                    ship: "EV",
                    station: "CXR"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightShip2CXR.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightShip2CXR.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightShip2CXR.flightDate,
                            ship: "EV",
                            station: "CXR"
                        }
                    });
            }

            if (flightPlan.flightDataVDH.flightData.length > 0) {
                //VHD
                searchData = {
                    date: flightPlan.flightDataVDH.flightDate,
                    ship: "MO",
                    station: "VDH"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataVDH.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataVDH.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataVDH.flightDate,
                            ship: "MO",
                            station: "VDH"
                        }
                    });
            }

            if (flightPlan.flightDataHUI.flightData.length > 0) {
                //HUI
                searchData = {
                    date: flightPlan.flightDataHUI.flightDate,
                    ship: "MO",
                    station: "HUI"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataHUI.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataHUI.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataHUI.flightDate,
                            ship: "MO",
                            station: "HUI"
                        }
                    });
            }

            if (flightPlan.flightDataVCL.flightData.length > 0) {
                //VCL
                searchData = {
                    date: flightPlan.flightDataVCL.flightDate,
                    ship: "MO",
                    station: "VCL"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataVCL.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataVCL.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataVCL.flightDate,
                            ship: "MO",
                            station: "VCL"
                        }
                    });
            }

            if (flightPlan.flightDataUIH.flightData.length > 0) {
                //UIH
                searchData = {
                    date: flightPlan.flightDataUIH.flightDate,
                    ship: "MO",
                    station: "UIH"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataUIH.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataUIH.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataUIH.flightDate,
                            ship: "MO",
                            station: "UIH"
                        }
                    });
            }

            if (flightPlan.flightDataTBB.flightData.length > 0) {
                //TBB
                searchData = {
                    date: flightPlan.flightDataTBB.flightDate,
                    ship: "MO",
                    station: "TBB"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataTBB.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataTBB.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataTBB.flightDate,
                            ship: "MO",
                            station: "TBB"
                        }
                    });
            }

            if (flightPlan.flightDataPXU.flightData.length > 0) {
                //PXU
                searchData = {
                    date: flightPlan.flightDataPXU.flightDate,
                    ship: "MO",
                    station: "PXU"
                }
                oldPlan = await downloadPlan(searchData);
                oldPlan = oldPlan.DT.planData;
                newPlan = await comparePlan(flightPlan.flightDataPXU.flightData, oldPlan);
                await db.Flight_Plan.update(
                    {
                        planData: newPlan,
                        rev: flightPlan.flightDataPXU.rev
                    },
                    {
                        where: {
                            datePlan: flightPlan.flightDataPXU.flightDate,
                            ship: "MO",
                            station: "PXU"
                        }
                    });

            }

            return {
                EM: 'Flight plan update sucessfully',
                EC: 0
            }
        } else {
            let flightShip1DAD = nestingArrayToString(flightPlan.flightShip1DAD.flightData);
            let flightShip2DAD = nestingArrayToString(flightPlan.flightShip2DAD.flightData);
            let flightShip1CXR = nestingArrayToString(flightPlan.flightShip1CXR.flightData);
            let flightShip2CXR = nestingArrayToString(flightPlan.flightShip2CXR.flightData);
            let flightVDH = "";
            if (flightPlan.flightDataVDH.flightData.length > 0) {
                flightVDH = nestingArrayToString(flightPlan.flightDataVDH.flightData);
            }
            let flightHUI = "";
            if (flightPlan.flightDataHUI.flightData.length > 0) {
                flightHUI = nestingArrayToString(flightPlan.flightDataHUI.flightData);
            }
            let flightVCL = "";
            if (flightPlan.flightDataVCL.flightData.length > 0) {
                flightVCL = nestingArrayToString(flightPlan.flightDataVCL.flightData);
            }
            let flightUIH = "";
            if (flightPlan.flightDataUIH.flightData.length > 0) {
                flightUIH = nestingArrayToString(flightPlan.flightDataUIH.flightData);
            }
            let flightTBB = "";
            if (flightPlan.flightDataTBB.flightData.length > 0) {
                flightTBB = nestingArrayToString(flightPlan.flightDataTBB.flightData);
            }
            let flightPXU = "";
            if (flightPlan.flightDataPXU.flightData.length > 0) {
                flightPXU = nestingArrayToString(flightPlan.flightDataPXU.flightData);
            }
            let WOData = "1/////////>2/////////"; //nesting array
            let shipLeader = "//>//"; //nesting array
            let handoverShip = "///";
            let driver = "//>//>//stby"; //nesting array
            let BDuty = "1///>2///>3///>4///>5///"; //nesting array
            let powerSource = "1///0/0/0////>2///0/0/0////>3///0/0/0////>4///0/0/0////>5///0/0/0////>6///0/0/0////>7///0/0/0////>8///0/0/0////>9///0/0/0////>10///0/0/0////"; //nesting array

            // create new flight plan
            await db.Flight_Plan.create({
                datePlan: flightPlan.flightShip1DAD.flightDate,
                rev: flightPlan.flightShip1DAD.rev,
                ship: flightPlan.flightShip1DAD.ship,
                planData: flightShip1DAD,
                station: "DAD",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightShip2DAD.flightDate,
                rev: flightPlan.flightShip2DAD.rev,
                ship: flightPlan.flightShip2DAD.ship,
                planData: flightShip2DAD,
                station: "DAD",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightShip1CXR.flightDate,
                rev: flightPlan.flightShip1CXR.rev,
                ship: flightPlan.flightShip1CXR.ship,
                planData: flightShip1CXR,
                station: "CXR",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightShip2CXR.flightDate,
                rev: flightPlan.flightShip2CXR.rev,
                ship: flightPlan.flightShip2CXR.ship,
                planData: flightShip2CXR,
                station: "CXR",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataVDH.flightDate,
                rev: flightPlan.flightDataVDH.rev,
                ship: flightPlan.flightDataVDH.ship,
                planData: flightVDH,
                station: "VDH",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataHUI.flightDate,
                rev: flightPlan.flightDataHUI.rev,
                ship: flightPlan.flightDataHUI.ship,
                planData: flightHUI,
                station: "HUI",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataVCL.flightDate,
                rev: flightPlan.flightDataVCL.rev,
                ship: flightPlan.flightDataVCL.ship,
                planData: flightVCL,
                station: "VCL",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataUIH.flightDate,
                rev: flightPlan.flightDataUIH.rev,
                ship: flightPlan.flightDataUIH.ship,
                planData: flightUIH,
                station: "UIH",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataTBB.flightDate,
                rev: flightPlan.flightDataTBB.rev,
                ship: flightPlan.flightDataTBB.ship,
                planData: flightTBB,
                station: "TBB",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })

            await db.Flight_Plan.create({
                datePlan: flightPlan.flightDataPXU.flightDate,
                rev: flightPlan.flightDataPXU.rev,
                ship: flightPlan.flightDataPXU.ship,
                planData: flightPXU,
                station: "PXU",
                WOData: WOData,
                shipLeader: shipLeader,
                handoverShip: handoverShip,
                driver: driver,
                BDuty: BDuty,
                powerSource: powerSource
            })
        }
        return {
            EM: 'Flight plan created sucessfully',
            EC: 0
        }

    } catch (error) {
        console.log(error)
        return {
            EM: 'something wrong in service',
            EC: -2
        }
    }
}

const downloadPlan = async (reqData) => {
    try {
        // Check plan is exit
        let isPlanExit = await checkPlanExit(reqData.date);
        if (!isPlanExit) {
            return {
                EM: 'Flight plan is not exist',
                EC: 1,
            }
        } else {
            let data = await db.Flight_Plan.findOne({
                where: {
                    datePlan: reqData.date,
                    ship: reqData.ship,
                    station: reqData.station
                },
                // attributes: ["rev", "planData", "powerData", "WOData", "shipLeader", "handoverShip", "driver", "BDuty", "powerSource"],
            });

            if (data) {
                let resData = data.dataValues;
                let flightShipData = stringToNestingArray(resData.planData);
                let rawWOData = stringToNestingArray(resData.WOData);
                let shipLeaderData = stringToNestingArray(resData.shipLeader);
                let handoverShip = stringToArray(resData.handoverShip);
                let driverData = stringToNestingArray(resData.driver);
                let BDutyData = stringToNestingArray(resData.BDuty);
                let powerSourceData = stringToNestingArray(resData.powerSource);

                //handle flightShip data
                let flightShip = [];
                flightShipData.map((individualData, index) => {
                    flightShip[index] = {
                        STT: index + 1,
                        AL: individualData[1],
                        ACReg: individualData[2],
                        ACType: individualData[3],
                        ArrNo: individualData[4],
                        DepNo: individualData[5],
                        Route: individualData[6],
                        ETA: individualData[7],
                        ETD: individualData[8],
                        Remark: individualData[9],
                        Parking: individualData[10],
                        CRS1: individualData[11],
                        MECH1: individualData[12],
                        CRS2: individualData[13],
                        MECH2: individualData[14],
                    };
                })
                //handle rawWOData
                let WOData = [];
                rawWOData.map((individualData, index) => {
                    WOData[index] = {
                        STT: index + 1,
                        code: individualData[1],
                        ACReg: individualData[2],
                        WONo: individualData[3],
                        Desc: individualData[4],
                        WHour: individualData[5],
                        CRS: individualData[6],
                        MECH1: individualData[7],
                        MECH2: individualData[8],
                        MECH3: individualData[9],
                    };
                })
                //handle shipLeader data
                let shipLeader = [];
                shipLeaderData.map((individualData, index) => {
                    shipLeader[index] = {
                        leader: individualData[0],
                        hours: individualData[1],
                        fromTo: individualData[2]
                    };
                })
                //handle driver data
                let driver = [];
                driverData.map((individualData, index) => {
                    driver[index] = {
                        driver: individualData[0],
                        hours: individualData[1],
                        fromTo: individualData[2]
                    };
                })
                //handle BDyty data
                let BDuty = [];
                BDutyData.map((individualData, index) => {
                    BDuty[index] = {
                        STT: individualData[0],
                        name: individualData[1],
                        func: individualData[2],
                        hours: individualData[3]
                    };
                })
                //handle powerSource data
                let powerSource = [];
                powerSourceData.map((individualData, index) => {
                    powerSource[index] = {
                        STT: individualData[0],
                        ID: individualData[1],
                        name: individualData[2],
                        work: individualData[3],
                        WPoint: individualData[4],
                        WHour: individualData[5],
                        hours: individualData[6],
                        type: individualData[7],
                        fromTo: individualData[8],
                        remark: individualData[9]
                    };
                })

                resData.planData = flightShip;
                resData.WOData = WOData;
                resData.shipLeader = shipLeader;
                resData.handoverShip = handoverShip;
                resData.driver = driver;
                resData.BDuty = BDuty;
                resData.powerSource = powerSource;

                return {
                    EM: 'Load flight plan sucessfully',
                    EC: 0,
                    DT: resData
                }
            } else {
                return {
                    EM: 'Flight plan not found',
                    EC: 2,
                    DT: ''
                }
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

const savePlan = async (reqData) => {
    try {
        let serverPlan = db.Flight_Plan.findOne({
            where: {
                datePlan: reqData.date,
                ship: reqData.ship,
                station: reqData.station
            },
        });
        if (!serverPlan) {
            return {
                EM: 'Flight plan is not exist',
                EC: 1,
            }
        } else {
            //handle planData to string
            reqData.planData.map((individualData, index) => {
                let array = [];
                array.push(individualData.STT);
                array.push(individualData.AL);
                array.push(individualData.ACReg);
                array.push(individualData.ACType);
                array.push(individualData.ArrNo);
                array.push(individualData.DepNo);
                array.push(individualData.Route);
                array.push(individualData.ETA);
                array.push(individualData.ETD);
                array.push(individualData.Remark);
                array.push(individualData.Parking);
                array.push(individualData.CRS1);
                array.push(individualData.MECH1);
                array.push(individualData.CRS2);
                array.push(individualData.MECH2);
                reqData.planData[index] = array;
            })
            let planData = nestingArrayToString(reqData.planData);
            //handle WOData to string
            reqData.WOData.map((individualData, index) => {
                let array = [];
                array.push(individualData.STT);
                array.push(individualData.code);
                array.push(individualData.ACReg);
                array.push(individualData.WONo);
                array.push(individualData.Desc);
                array.push(individualData.WHour);
                array.push(individualData.CRS);
                array.push(individualData.MECH1);
                array.push(individualData.MECH2);
                array.push(individualData.MECH3);
                reqData.WOData[index] = array;
            })
            let WOData = nestingArrayToString(reqData.WOData);
            //handle powerSource to string
            reqData.powerSource.map((individualData, index) => {
                let array = [];
                array.push(individualData.STT);
                array.push(individualData.ID);
                array.push(individualData.name);
                array.push(individualData.work);
                array.push(individualData.WPoint);
                array.push(individualData.WHour);
                array.push(individualData.hours);
                array.push(individualData.type);
                array.push(individualData.fromTo);
                array.push(individualData.remark);
                reqData.powerSource[index] = array;
            })
            let powerSource = nestingArrayToString(reqData.powerSource);
            //handle BDuty to string
            reqData.BDuty.map((individualData, index) => {
                let array = [];
                array.push(individualData.STT);
                array.push(individualData.name);
                array.push(individualData.func);
                array.push(individualData.hours);
                reqData.BDuty[index] = array;
            })
            let BDuty = nestingArrayToString(reqData.BDuty);
            //handle driver to string
            reqData.driver.map((individualData, index) => {
                let array = [];
                array.push(individualData.driver);
                array.push(individualData.hours);
                array.push(individualData.fromTo);
                reqData.driver[index] = array;
            })
            let driver = nestingArrayToString(reqData.driver);
            //handle handoverShip to tring
            let handoverShip = arrayToString(reqData.handoverShip);
            //handle shipLeader to string
            reqData.shipLeader.map((individualData, index) => {
                let array = [];
                array.push(individualData.leader);
                array.push(individualData.hours);
                array.push(individualData.fromTo);
                reqData.shipLeader[index] = array;
            })
            let shipLeader = nestingArrayToString(reqData.shipLeader);
            await db.Flight_Plan.update(
                {
                    planData: planData,
                    WOData: WOData,
                    powerSource: powerSource,
                    shipLeader: shipLeader,
                    handoverShip: handoverShip,
                    driver: driver,
                    BDuty: BDuty,
                    powerSource: powerSource,
                    rev: reqData.rev
                },
                {
                    where: {
                        datePlan: reqData.date,
                        ship: reqData.ship,
                        station: reqData.station
                    }
                });
            return {
                EM: 'Save flight plan sucessful',
                EC: 0,
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

const downloadTeam = async (req) => {
    try {
        let users = await db.Users.findAll({
            where: {
                division: req.team,
                station: req.station
            },
            attributes: ["id", "vae_id", "surname", "name", "division", "station", "remark"],
        })
        if (users) {
            return {
                EM: 'search user sucessfully',
                EC: 0,
                DT: users
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

const checkPointCodeExist = async (pointCode) => {
    let data = await db.Point_code.findOne({
        where: {
            code: pointCode.code,
            ACType: pointCode.ACType,
            type: pointCode.type,
            remark: pointCode.remark
        }
    })

    if (data) { return true; }
    return false;
}

const createNewPointCode = async (pointCode) => {
    try {
        //check pointCode is exist
        let isPointCodeExist = await checkPointCodeExist(pointCode);
        if (isPointCodeExist === true) {
            return {
                EM: 'Point code is already exist',
                EC: 1,
            }
        } else {
            // create new point code
            await db.Point_code.create({
                airline: pointCode.airline,
                code: pointCode.code,
                ACType: pointCode.ACType,
                type: pointCode.type,
                maxTime: pointCode.maxTime,
                remark: pointCode.remark,
                CRSWHour: pointCode.CRSWHour,
                MECHWHour: pointCode.MECHWHour,
                CRSWPoint: pointCode.CRSWPoint,
                MECHWPoint: pointCode.MECHWPoint,
            })
            return {
                EM: 'Point code created sucessfully',
                EC: 0
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

const getPointCodeWithPagination = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;
        let { count, rows } = await db.Point_code.findAndCountAll({
            order: [['airline', 'ASC']],
            offset: offset, //số item bỏ đi
            limit: limit, //số item muốn lấy
        })

        let totalPages = Math.ceil(count / limit);
        let data = {
            totalRows: count,
            totalPages: totalPages,
            pointCode: rows
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

const updatePCInfo = async (pointCode) => {
    try {
        let serverpointCode = await db.Point_code.findOne({
            where: {
                id: pointCode.id,
            }
        })
        // Update point code
        if (serverpointCode) {
            await db.Point_code.update(pointCode, {
                where: {
                    id: pointCode.id,
                }
            });
            return {
                EM: 'Point code updated sucessfully',
                EC: 0,
                DT: ''
            }
        } else {
            return {
                EM: 'Point code not found',
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

const deletePCInfo = async (id) => {
    try {
        let serverpointCode = await db.Point_code.findOne({
            where: { id: id }
        })
        if (serverpointCode) {
            await serverpointCode.destroy()
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

const handleSearchPC = async (searchValue) => {
    try {
        let pointCode = await db.Point_code.findAll({
            where: {
                [Op.or]: [
                    { code: searchValue },
                    { ACType: searchValue },
                    { type: searchValue },
                ]
            },
        })
        if (pointCode) {
            return {
                EM: 'search point code sucessfully',
                EC: 0,
                DT: pointCode
            }
        } else {
            return {
                EM: 'Point code not found',
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

const getAllPC = async () => {
    try {
        let data = await db.Point_code.findAll();
        if (data) {
            return {
                EM: 'get all point code sucess',
                EC: 0,
                DT: data
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

const getGroupUsers = async (req) => {
    try {
        let users = await db.Users.findAll({
            where: {
                division: req.division,
                station: req.station
            },
            attributes: ["id", "vae_id", "surname", "name", "division"],
            order: [['name', 'ASC']],
        })
        if (users) {
            return {
                EM: 'search user sucessfully',
                EC: 0,
                DT: users
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

const getPowerData = async (date) => {
    try {
        let data = await db.Flight_Plan.findAll({
            where: {
                datePlan: date
            },
            attributes: ["powerSource"],
        })
        if (data) {
            for (var i = 0; i < data.length; i++) {
                data[i] = stringToNestingArray(data[i].powerSource);
                data[i].map((individualData, index) => {
                    data[i][index] = {
                        STT: individualData[0],
                        ID: individualData[1],
                        name: individualData[2],
                        work: individualData[3],
                        WPoint: individualData[4],
                        WHour: individualData[5],
                        hours: individualData[6],
                        type: individualData[7],
                        fromTo: individualData[8]
                    };
                })
            }
            return {
                EM: 'search powerSource sucessfully',
                EC: 0,
                DT: data
            }
        } else {
            return {
                EM: 'powerSource not found',
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
    registerNewUser, handleUserLogin, getAllUser, updateUserInfo, deleteUserInfo, resetPasswordInfo, getUserWithPagination,
    changePasswordInfo, handleSearchUser, uploadPlan, downloadPlan, savePlan, downloadTeam, createNewPointCode,
    getPointCodeWithPagination, updatePCInfo, deletePCInfo, handleSearchPC, getAllPC, getGroupUsers, getPowerData
}