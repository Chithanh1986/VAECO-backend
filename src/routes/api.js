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
    router.post("/search_user", apiController.searchUser);
    router.post("/flight_plan", apiController.uploadFlightPlan);
    router.post("/load_plan", apiController.loadPlan);
    router.post("/save_plan", apiController.savePlan);
    router.post("/load_team", apiController.loadTeam);
    router.post("/create_pointCode", apiController.createPointCode);
    router.get("/show_pointCode", apiController.showPointCode);
    router.put("/updatePC", apiController.updatePC);
    router.delete("/deletePC", apiController.deletePC);
    router.post("/search_PC", apiController.searchPC);
    router.get("/show_all_PC", apiController.showAllPC);
    router.post("/getGroupUsers", apiController.groupUsers);
    router.post("/getPowerData", apiController.powerData);
    router.post("/saveEA", apiController.saveEA);
    router.post("/loadEA", apiController.loadEA);

    return app.use("/api/", router);
}

export default initApiRoutes;