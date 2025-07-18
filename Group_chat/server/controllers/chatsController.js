const UserTable = require('../models/userTable');
const ChatTable = require('../models/mesagetable');
const GroupsTable=require('../models/groupsTable');
const { Sequelize } = require('sequelize');

// const getchats = async (req, res) => {
//     try {
//         const chats = await ChatTable.findAll({
//             order: [['createdAt', 'DESC']],
//             limit: 10,
//             include: [{ model: UserTable, attributes: ['name'] }]
//         });

//         const reversedchats = chats.reverse();
//         res.status(200).json({ chats: reversedchats });
//     } catch (err) {
//         res.status(500).json({ message: 'Something went wrong', error: err.message });
//     }
// }

const getchats=async(req,res)=>{
     const lastId = +req.query.lastmessageid;
     const groupId= req.query.groupId || 100;
     try {
        const newChats=await ChatTable.findAll({
            where:{
                id:{
                    [Sequelize.Op.gt]:lastId
                },
                groupId:groupId
            },
            include: [{ model: UserTable, attributes: ['name'] }],
            order: [['id', 'ASC']]
        });
        console.log(newChats);
         const formatted = newChats.map(chat => ({
            id: chat.id,
            message: chat.message,
            name: chat.user.name,
            createdAt: chat.createdAt
        }));
        //await GroupsTable.findOrCreate({where: { id: 100 },defaults: { name: 'Common Group' }});
        res.status(200).json(formatted);
     } catch (error) {
         res.status(500).json({ message: 'Error fetching chats', error: error.message });
     }
}

const storemessage = async (req, res) => {

    try {
        const { message,GroupId } = req.body;
        console.log(message)
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const newmessage = await ChatTable.create({
            senderId: req.user.id,
            message:message,
            groupId:GroupId

        });
        res.status(201).json({id: newmessage.id ,message: newmessage.message, name: req.user.name, createdAt: newmessage.createdAt});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }

}

module.exports = {
    getchats,
    storemessage
}