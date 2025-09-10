const jwt=require('jsonwebtoken');
const sendcookie = (res, user, message, statuscode=200) => {
    const token=jwt.sign(
        {_id: user._id}, "default_secret_key"
    );
    res.status(statuscode).cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
        secure: false, // Set to false for development (localhost)
        sameSite: "lax", // Changed from "none" to "lax" for localhost

    }).send(message);
}
module.exports = sendcookie;