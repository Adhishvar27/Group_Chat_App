const bcrypt=require('bcrypt');
const UserTable=require('../models/userTable');

const usersignup=async(req,res)=>{
    try {
        const {name,email,phone,password}=req.body;
        console.log(name,email,phone,password);
        const isExisting=await UserTable.findOne({where:{email:email}});
        if(isExisting){
            return res.status(400).json({message:'user already exisit'});
        }
        const saltround=10;
        bcrypt.hash(password,saltround,async (err,hash)=>{
            if(err){
                console.log(err);
                return res.status(500).json({message:'Error while hashing the password'});
            }
            const newUser=await UserTable.create({name,email,phone,password:hash});
            res.status(200).json({newUser: newUser,message:'User Created successfully'});
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message : error});
    }
}

module.exports={
    usersignup
}