const jwt=require('jsonwebtoken');
const sendcookie = (res, user, message, statuscode=200) => {
    const token=jwt.sign(
        {_id: user._id}, "default_secret_key"
    );
    res.status(statuscode).cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
        secure: false, 
        sameSite: "lax", 
   }).send(message);
}
module.exports = sendcookie;