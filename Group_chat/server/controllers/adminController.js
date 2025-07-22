const UserTable=require('../models/userTable');
const UsersGroups = require('../models/usersgroups');
const { Sequelize } = require('sequelize');

const nonMembers=async (req, res) => {
    try {
        const  groupId  = Number(req.query.groupId);

        if (!groupId || isNaN(parseInt(groupId))) {
    return res.status(400).json({ message: 'Group ID is required' });
}

        
        const members = await UsersGroups.findAll({ 
            where: { groupId },
            attributes: ['userId']
        });
        
        const memberIds = members.map(m => m.userId);

        const nonMembers = await UserTable.findAll({
            where: {
                id: { [Sequelize.Op.notIn]: memberIds }
            },
            attributes: ['id', 'name', 'email', 'phone']
        });

        res.status(200).json(nonMembers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching non-members', error: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { query, groupId } = req.body;

        if (!groupId || isNaN(parseInt(groupId))) {
    return res.status(400).json({ message: 'Group ID is required' });
}

        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        // Get current group members to exclude them
        const members = await UsersGroups.findAll({ 
            where: { groupId },
            attributes: ['userId']
        });
        
        const memberIds = members.map(m => m.userId);

        const users = await UserTable.findAll({
            where: {
                id: { [Sequelize.Op.notIn]: memberIds },
                [Sequelize.Op.or]: [
                    { name: { [Sequelize.Op.like]: `%${query}%` } },
                    { email: { [Sequelize.Op.like]: `%${query}%` } },
                    { phone: { [Sequelize.Op.like]: `%${query}%` } }
                ]
            },
            attributes: ['id', 'name', 'email', 'phone'],
            limit: 20
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
};

const checkAdminStatus = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const userGroup = await UsersGroups.findOne({
            where: { userId, groupId }
        });

        if (!userGroup) {
            return res.status(404).json({ message: 'User not found in group', isAdmin: false });
        }

        res.status(200).json({ 
            isAdmin: userGroup.isAdmin,
            isMember: true,
            joinedAt: userGroup.joinedAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking admin status', error: error.message });
    }
};

module.exports={
    nonMembers,
    searchUsers,
    checkAdminStatus
};
