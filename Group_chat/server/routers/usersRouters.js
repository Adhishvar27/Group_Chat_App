const express=require('express');
const router=express.Router();

const userscontroller=require('../controllers/usersController')
router.post('/signup',userscontroller.usersignup);
router.post('/login',userscontroller.userlogin);

// after login to retive all the users
router.get('/getvalue',userscontroller.getallusers);

module.exports=router