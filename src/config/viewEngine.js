import express from "express";

/**
 * 
 * @param {*} app - express app
 */
const configViewEngine = (app) => {
    app.use(express.static('./src/public')); //chỉ cho phép user truy cập public
    app.set("view engine", "ejs");// định nghĩa view engine: ejs
    app.set("views", "./src/views") // định nghĩa nơi lưu file
}

export default configViewEngine;