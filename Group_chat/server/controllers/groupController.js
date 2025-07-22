const GroupTable=require('../models/groupsTable');
const UsersGroups=require('../models/usersgroups');
const UserTable=require('../models/userTable');
const { Sequelize } = require('sequelize');

const createGroup=async(req,res)=>{
    try {
        const {name}=req.body;
        
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        const newgroup=await GroupTable.create({
            name: name.trim(),
            admin:req.user.id
        });

        // Add creator as admin member
        await UsersGroups.create({
            userId:req.user.id,
            groupId:newgroup.id,
            isAdmin:true
        });

        res.status(201).json({
            id: newgroup.id,
            name: newgroup.name,
            admin: newgroup.admin,
            message: 'Group created successfully'
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Group name already exists' });
        } else {
            res.status(500).json({ message: 'Error creating group', error: error.message });
        }
    }
};

const allGroups=async(req,res)=>{
    try {
        const allgroups=await UsersGroups.findAll({
            where:{
                userId:req.user.id
            },
            include:[{
                model:GroupTable, 
                as: 'group', 
                attributes :['id','name','admin']
            }]
        });

        const formattedData=allgroups.map(row=>({
            id:row.group.id,
            name:row.group.name,
            admin:row.group.admin,
            isAdmin:row.isAdmin,
            joinedAt:row.joinedAt
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

const groupMembers = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        const isAlready = await UsersGroups.findOne({ where: { groupId, userId } });
        if (isAlready) {
            return res.status(400).json({ message: 'User already a member' });
        }

        await UsersGroups.create({ 
            groupId, 
            userId,
            isAdmin: false 
        });
        
        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding member', error: error.message });
    }
};

const removeGroupMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const requesterId = req.user.id;

        // Cannot remove yourself if you're the original admin
        const group = await GroupTable.findByPk(groupId);
        if (group.admin === userId && group.admin === requesterId) {
            return res.status(400).json({ message: 'Group creator cannot be removed' });
        }

        const deleted = await UsersGroups.destroy({
            where: { groupId, userId }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: 'User not found in group' });
        }

        res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member', error: error.message });
    }
};

const makeAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const updated = await UsersGroups.update(
            { isAdmin: true },
            { where: { groupId, userId } }
        );

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'User not found in group' });
        }

        res.status(200).json({ message: 'User promoted to admin successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error promoting user', error: error.message });
    }
};

const removeAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const requesterId = req.user.id;

        // Cannot remove admin rights from group creator
        const group = await GroupTable.findByPk(groupId);
        if (group.admin === userId) {
            return res.status(400).json({ message: 'Cannot remove admin rights from group creator' });
        }

        const updated = await UsersGroups.update(
            { isAdmin: false },
            { where: { groupId, userId } }
        );

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'User not found in group' });
        }

        res.status(200).json({ message: 'Admin rights removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing admin rights', error: error.message });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const groupId  = Number(req.query.groupId);

        const members = await UsersGroups.findAll({
            where: { groupId },
            include: [{
                model: UserTable,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'isOnline']
            }],
            order: [['isAdmin', 'DESC'], ['joinedAt', 'ASC']]
        });

        const formattedMembers = members.map(member => ({
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
            phone: member.user.phone,
            isOnline: member.user.isOnline,
            isAdmin: member.isAdmin,
            joinedAt: member.joinedAt
        }));

        res.status(200).json(formattedMembers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group members', error: error.message });
    }
};

module.exports={
    createGroup,
    allGroups,
    groupMembers,
    removeGroupMember,
    makeAdmin,
    removeAdmin,
    getGroupMembers
};
