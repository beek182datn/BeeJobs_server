// import { Express } from "express";
const express = require('express') 


/**
 * 
 * @param {} app --express app 
 */
const configViewEngine = (app) => {
    app.use(express.static('./src/public'))
    app.set("view engine", "ejs");
    // app.set("view", "./src/view"); //định nghĩa nơi lưu file
    app.set("views","./src/views")
}

module.exports = configViewEngine;
