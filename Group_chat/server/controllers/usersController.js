const bcrypt=require('bcrypt');
const UserTable=require('../models/userTable');
const jwt=require('jsonwebtoken');

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

function generatejwttoken(id,name){
    return jwt.sign({userId:id,userName:name},'cP6+yF@7z%wUb4N!kHq2Rs&E^YjX*Z#vJm3!tQ^pFqL9$Gn6Rd0HbXs!oLjA%TrCq');
}

const userlogin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const isExisting=await UserTable.findOne({where:{email:email}});
        if(!isExisting){
            return res.status(404).json({message:'User Not Found'});
        }
        bcrypt.compare(password,isExisting.password,async(err,result)=>{
            if(err){
                throw new Error('Somthing went wrong');
            }
            if(result===true){
                await UserTable.update({isOnline:true},{
                    where:{
                        email:email
                    }
                });
                return res.status(200).json({message:'Login Successfully',Username:isExisting.name,token:generatejwttoken(isExisting.id,isExisting.name)});
            }
            else{
                return res.status(400).json({message:'Password is inncorrect'});
            }
        })
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const getallusers=async(req,res)=>{
    try {
        const alluser=await UserTable.findAll();
        res.status(200).json(alluser);
    } catch (error) {
        res.status(500).json(error.message);
    }
}

module.exports={
    usersignup,
    userlogin,
    getallusers
}