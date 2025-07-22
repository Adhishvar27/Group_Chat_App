const express = require('express');
const router = express.Router();
const { authenticateuser } = require('../middleware/userauth');
const { checkGroupMembership } = require('../middleware/adminMiddleware');
const userscontroller = require('../controllers/usersController');

// Authentication routes
router.post('/signup', userscontroller.usersignup);
router.post('/login', userscontroller.userlogin);
router.post('/logout', authenticateuser, userscontroller.logoutuser);
router.post('/markifonline', authenticateuser, userscontroller.markifonline);

// User listing
router.get('/getvalue', userscontroller.getallusers);

// Admin functionality
const adminController = require('../controllers/adminController');
router.get('/nonmembers', authenticateuser, checkGroupMembership, adminController.nonMembers);
router.post('/searchusers', authenticateuser, checkGroupMembership, adminController.searchUsers);
router.get('/adminstatus/:groupId', authenticateuser, adminController.checkAdminStatus);

module.exports = router;
