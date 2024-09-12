import userServiceApi from '../service/userServiceApi';

const handleRegister = async (req, res) => {
    try {
        let data = await userServiceApi.registerNewUser(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const handleLogin = async (req, res) => {
    try {
        let data = await userServiceApi.handleUserLogin(req.body);
        //set cookie
        if (data && data.DT && data.DT.access_token) {
            res.cookie("jwt", data.DT.access_token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
        }

        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT, // data
        })
    } catch (error) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const showUser = async (req, res) => {
    try {
        if (req.query.page && req.query.limit) {
            let page = req.query.page;
            let limit = req.query.limit;
            let data = await userServiceApi.getUserWithPagination(+page, +limit);//chuyển page và limit sang kiểu số
            return res.status(200).json({
                EM: data.EM, //error message
                EC: data.EC, //error code
                DT: data.DT
            })
        } else {
            let data = await userServiceApi.getAllUser();
            return res.status(200).json({
                EM: data.EM, //error message
                EC: data.EC, //error code
                DT: data.DT
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const updateUser = async (req, res) => {
    try {
        let data = await userServiceApi.updateUserInfo(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        let data = await userServiceApi.deleteUserInfo(req.body.id);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        let data = await userServiceApi.resetPasswordInfo(req.body.data.id);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const getUserAccount = async (req, res) => {
    return res.status(200).json({
        EM: 'ok', //error message
        EC: 0, //error code
        DT: {
            access_token: req.token,
            group: req.user.group,
            vae_user: req.user.vae_user
        }
    })
}

const handleLogout = (req, res) => {
    try {
        res.clearCookie("jwt")
        return res.status(200).json({
            EM: 'cleared cookie', //error message
            EC: 0, //error code
            DT: ''
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const changePassword = async (req, res) => {
    try {
        let data = await userServiceApi.changePasswordInfo(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const searchUser = async (req, res) => {
    try {
        let data = await userServiceApi.handleSearchUser(req.body.searchValue);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT, // data
        })
    } catch (error) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const uploadFlightPlan = async (req, res) => {
    try {
        let data = await userServiceApi.uploadPlan(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const loadPlan = async (req, res) => {
    try {
        let data = await userServiceApi.downloadPlan(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT, // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const savePlan = async (req, res) => {
    try {
        let data = await userServiceApi.savePlan(req.body.reqData);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const loadTeam = async (req, res) => {
    try {
        let data = await userServiceApi.downloadTeam(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT, // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const createPointCode = async (req, res) => {
    try {
        let data = await userServiceApi.createNewPointCode(req.body.pointCode);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const showPointCode = async (req, res) => {
    try {
        if (req.query.page && req.query.limit) {
            let page = req.query.page;
            let limit = req.query.limit;
            let data = await userServiceApi.getPointCodeWithPagination(+page, +limit);//chuyển page và limit sang kiểu số
            return res.status(200).json({
                EM: data.EM, //error message
                EC: data.EC, //error code
                DT: data.DT
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const updatePC = async (req, res) => {
    try {
        let data = await userServiceApi.updatePCInfo(req.body.pointCode);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const deletePC = async (req, res) => {
    try {
        let data = await userServiceApi.deletePCInfo(req.body.id);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const searchPC = async (req, res) => {
    try {
        let data = await userServiceApi.handleSearchPC(req.body.searchValue);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (error) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const showAllPC = async (req, res) => {
    try {
        let data = await userServiceApi.getAllPC();//chuyển page và limit sang kiểu số
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const groupUsers = async (req, res) => {
    try {
        let data = await userServiceApi.getGroupUsers(req.body);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const powerData = async (req, res) => {
    try {
        let data = await userServiceApi.getPowerData(req.body.date);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const saveEA = async (req, res) => {
    try {
        let data = await userServiceApi.savePhase(req.body.phase);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: '', // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

const loadEA = async (req, res) => {
    try {
        let data = await userServiceApi.loadPhase(req.body.date);
        return res.status(200).json({
            EM: data.EM, //error message
            EC: data.EC, //error code
            DT: data.DT, // data
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server', //error message
            EC: '-1', //error code
            DT: '', // data
        })
    }
}

module.exports = {
    handleRegister, handleLogin, showUser, updateUser, deleteUser, resetPassword, getUserAccount, handleLogout, changePassword,
    searchUser, uploadFlightPlan, loadPlan, savePlan, loadTeam, createPointCode, showPointCode, updatePC, deletePC, searchPC,
    showAllPC, groupUsers, powerData, saveEA, loadEA
}