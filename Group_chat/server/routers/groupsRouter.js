const express=require('express');
const router=express.Router();
const {authenticateuser}=require('../middleware/userauth');
const {checkAdminPrivileges, checkGroupMembership}=require('../middleware/adminMiddleware');
const groupController=require('../controllers/groupController');

// Group creation and listing
router.post('/creation',authenticateuser,groupController.createGroup);
router.get('/all',authenticateuser,groupController.allGroups);

// Member management (admin only)
router.post('/addmember', authenticateuser, checkAdminPrivileges, groupController.groupMembers);
router.post('/removemember', authenticateuser, checkAdminPrivileges, groupController.removeGroupMember);

// Admin management (admin only)
router.post('/makeadmin', authenticateuser, checkAdminPrivileges, groupController.makeAdmin);
router.post('/removeadmin', authenticateuser, checkAdminPrivileges, groupController.removeAdmin);

// Group info (member access)
router.get('/members', authenticateuser, checkGroupMembership, groupController.getGroupMembers);

module.exports=router;
