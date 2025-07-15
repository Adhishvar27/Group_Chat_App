const express=require('express');
const router=express.Router();

const userscontroller=require('../controllers/usersController')
router.post('/signup',userscontroller.usersignup);
router.post('/login',userscontroller.userlogin);

module.exports=router