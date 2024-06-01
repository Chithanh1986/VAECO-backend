import userService from '../service/userService';

const handleLogin = (req, res) => {
    return res.render("home.ejs");
}

const handleUserPage = async (req, res) => {
    let userList = await userService.getUserList();
    return res.render("user.ejs", { userList });
}

const handleCreateNewUser = async (req, res) => {
    let vae_user = req.body.vae_user;
    let vae_id = req.body.vae_id;
    let password = req.body.password;
    let group = req.body.group;

    await userService.createNewUser(vae_user, vae_id, password, group)

    return res.redirect("/user");
}

const handleDeleteUser = (req, res) => {
    userService.deleteUser(req.params.id);
    return res.redirect("/user");
}

const getUpdateUser = async (req, res) => {
    let id = req.params.id;
    let userData = await userService.getUserById(id);
    return res.render("user-update.ejs", { userData });
}

const handleUpdateUser = async (req, res) => {
    let vae_user = req.body.vae_user;
    let vae_id = req.body.vae_id;
    let group = req.body.group;
    let id = req.body.id;
    await userService.updateUserInfo(vae_user, vae_id, group, id);
    return res.redirect("/user");
}

module.exports = {  //phương thức export node hổ trợ xuất ra 1 file
    handleLogin, handleUserPage, handleCreateNewUser, handleDeleteUser, getUpdateUser, handleUpdateUser
}