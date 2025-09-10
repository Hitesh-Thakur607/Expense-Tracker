const userInfo=require("../modals/user");
const sendcookie=require('../util/cokkies');
const login =async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
      return  res.send("Please provide email and password");
    }
    const user=await userInfo.findOne({email});
    if(user){
        if(user.password===password){
         return sendcookie(res, user, "Login Successful");
        }else{
          return  res.send("Invalid Password");
        }
    }
    else{
     return   res.send("User not found");
    }
    
}
const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
       return res.send("Please provide name, email and password");
    }
     const user= await userInfo.findOne({email});
    if(user){
     return   res.send("user already exists");
    }
    else{
       const newUser= new userInfo({name,email,password});
       await newUser.save();
      return  res.send("user created sucessfully");
    }
}
module.exports={login,register};