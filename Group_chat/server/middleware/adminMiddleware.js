const UsersGroups = require('../models/usersgroups');

const checkAdminPrivileges = async (req, res, next) => {
    try {
        const { groupId } = req.body;
        const userId = req.user.id;

        // Skip admin check for common group (id: 100)
        if (groupId === 100) {
            return res.status(403).json({ message: 'Cannot perform admin actions on common group' });
        }

        const userGroup = await UsersGroups.findOne({
            where: { userId, groupId }
        });

        if (!userGroup) {
            return res.status(403).json({ message: 'User is not a member of this group' });
        }

        if (!userGroup.isAdmin) {
            return res.status(403).json({ message: 'Admin privileges required' });
        }

        req.userGroup = userGroup;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking admin privileges', error: error.message });
    }
};


async function checkGroupMembership(req, res, next) {
  try {
    // Accept groupId from either body (for POST) or params (for GET)
   const groupId =Number(req.query.groupId)
    console.log(groupId);

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required check' });
    }

    const userId = req.user.id;
    const userGroup = await UsersGroups.findOne({ where: { userId, groupId } });
    if (!userGroup) {
      return res.status(403).json({ message: 'User is not a member of this group' });
    }

    req.userGroup = userGroup;
    next();
  } catch (err) {
    console.error('Error checking group membership:', err);
    res.status(500).json({
      message: 'Error checking group membership',
      error: err.message,
    });
  }
}


module.exports = {
    checkAdminPrivileges,
    checkGroupMembership
};
