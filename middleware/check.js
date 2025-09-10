const jwt = require('jsonwebtoken');
const User = require('../modals/user.js');

const isauthenticated = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token) {
            return res.status(401).send("No token provided, authorization denied");
        }
        const decoded = jwt.verify(token,  "default_secret_key");
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send("Internal server error");
    }
};

module.exports = { isauthenticated };