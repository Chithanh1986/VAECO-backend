import express from "express";
import apiController from "../controller/apiController";
import { checkUserJWT, checkUserPermission } from "../midleware/JWTAction";

const router = express.Router();

/**
 * 
 * @param {*} app : express app
 */

const initApiRoutes = (app) => {
    //rest API
    router.post("/login", apiController.handleLogin);
    router.post("/logout", apiController.handleLogout);


    router.all('*', checkUserJWT, checkUserPermission);
    router.post("/register", apiController.handleRegister);

    router.put("/update", apiController.updateUser);
    router.delete("/delete", apiController.deleteUser);
    router.put("/resetPassword", apiController.resetPassword);
    router.get("/account", apiController.getUserAccount);
    router.get("/show_user", apiController.showUser);
    router.post("/changePassword", apiController.changePassword);
    router.post("/search_user", apiController.searchUser)

    return app.use("/api/", router);
}

export default initApiRoutes;