const express=require('express');
const router=express.Router();
const {authenticateuser}=require('../middleware/userauth')

const userscontroller=require('../controllers/usersController')
router.post('/signup',userscontroller.usersignup);
router.post('/login',userscontroller.userlogin);

// after login to retive all the users
router.get('/getvalue',userscontroller.getallusers);
router.post('/logout',authenticateuser,userscontroller.logoutuser);
router.post('/markifonline',authenticateuser,userscontroller.markifonline);

module.exports=router