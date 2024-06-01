import express from "express";
import homeController from "../controller/homeController";
import apiController from "../controller/apiController";

const router = express.Router();

/**
 * 
 * @param {*} app : express app
 */
const initWebRoutes = (app) => {
    router.get("/", homeController.handleLogin)
    router.get("/user", homeController.handleUserPage)
    router.post("/user/create-user", homeController.handleCreateNewUser)
    router.post("/delete-user/:id", homeController.handleDeleteUser)
    router.get("/update-user/:id", homeController.getUpdateUser)
    router.post("/user/update-user", homeController.handleUpdateUser)

    //rest API
    // router.get("/api/test-api", apiController.testApi);

    return app.use("/", router);
}

export default initWebRoutes;