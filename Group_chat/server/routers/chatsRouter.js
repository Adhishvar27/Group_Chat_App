const express=require('express');
const router=express.Router();
const {authenticateuser}=require('../middleware/userauth');

const chatscontroller=require('../controllers/chatsController');
//router.get('/groupchats',chatscontroller.getchats);
router.get(`/getMessage`,chatscontroller.getchats);
router.post('/messagestore',authenticateuser,chatscontroller.storemessage);


module.exports=router