
var userMD = require("../model/Users");
var { jwtMiddleware, createJWT, checkJWT } = require("../middleware/JWT");
const { userModel } = require("../model/Users");


module.exports = async function(req, res, next) {
    try {
        if (!req.cookies.jwt) {
            return next();
        }

        const token = checkJWT(req.cookies.jwt);
        if (!token) {
            return res.status(401).json({ status: 0, msg: "Token not found" });
        }

        const user = await userModel.findById(token.payload.sub);
        if (!user) {
            return res.status(404).json({ status: 0, msg: "User not found" });
        }

        res.locals.userInfo = user;
        next();
    } catch (error) {
        res.status(500).json({ status: 0, msg: "Server error", error: error.message });
    }
};