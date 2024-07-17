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

const uploadPlan = async (flightPlan) => {
    try {
        //Check plan is exit
        let isPlanExit = await checkPlanExit(flightPlan.flightShip1DAD.flightDate)

        if (isPlanExit) {
            return {
                EM: 'Flight plan is already exist',
                EC: 1,
            }
        } else {
            let flightShip1DAD = nestingArrayToString(flightPlan.flightShip1DAD.flightData);
            let flightShip2DAD = nestingArrayToString(flightPlan.flightShip2DAD.flightData);
            let flightShip1CXR = nestingArrayToString(flightPlan.flightShip1CXR.flightData);
            let flightShip2CXR = nestingArrayToString(flightPlan.flightShip2CXR.flightData);
            let WOData = "1////////>2////////"; //nesting array
            let shipLeader = "//>//"; //nesting array
            let handoverShip = "/";
            let driver = "//>//"; //nesting array
            let BDuty = "1///>2///>3///>4///>4///"; //nesting array
            let powerSource = "1///0/0///>2///0/0///>3///0/0///>4///0/0///>5///0/0///>6///0/0///>7///0/0///>8///0/0///>9///0/0///>10///0/0///"; //nesting array

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

            return {
                EM: 'Flight plan created sucessfully',
                EC: 0
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
                        ACReg: individualData[1],
                        WONo: individualData[2],
                        Desc: individualData[3],
                        Remark: individualData[4],
                        CRS: individualData[5],
                        MECH1: individualData[6],
                        MECH2: individualData[7],
                        MECH3: individualData[8],
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
                        point: individualData[4],
                        hours: individualData[5],
                        type: individualData[6],
                        fromTo: individualData[7]
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
                array.push(individualData.ACReg);
                array.push(individualData.WONo);
                array.push(individualData.Desc);
                array.push(individualData.Remark);
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
                array.push(individualData.point);
                array.push(individualData.hours);
                array.push(individualData.type);
                array.push(individualData.fromTo);
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
                EM: 'Flight plan update sucessful',
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
            type: pointCode.type
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

module.exports = {
    registerNewUser, handleUserLogin, getAllUser, updateUserInfo, deleteUserInfo, resetPasswordInfo, getUserWithPagination,
    changePasswordInfo, handleSearchUser, uploadPlan, downloadPlan, savePlan, downloadTeam, createNewPointCode,
    getPointCodeWithPagination, updatePCInfo, deletePCInfo, handleSearchPC
}