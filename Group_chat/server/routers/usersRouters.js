const express=require('express');
const router=express.Router();

const userscontroller=require('../controllers/usersController')
router.post('/signup',userscontroller.usersignup);

module.exports=router