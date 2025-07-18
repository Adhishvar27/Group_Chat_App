const express=require('express');
const router=express.Router();
const {authenticateuser}=require('../middleware/userauth');

const groupController=require('../controllers/groupController');
router.post('/creation',authenticateuser,groupController.createGroup);
router.get('/all',groupController.allGroups)

module.exports=router