const UserTable = require('../models/userTable');
const ChatTable = require('../models/mesagetable');
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
     try {
        const newChats=await ChatTable.findAll({
            where:{
                id:{
                    [Sequelize.Op.gt]:lastId
                }
            },
            include: [{ model: UserTable, attributes: ['name'] }],
            order: [['id', 'ASC']]
        });
         const formatted = newChats.map(chat => ({
            id: chat.id,
            message: chat.message,
            name: chat.user.name,
            createdAt: chat.createdAt
        }));

        res.status(200).json(formatted);
     } catch (error) {
         res.status(500).json({ message: 'Error fetching chats', error: error.message });
     }
}

const storemessage = async (req, res) => {

    try {
        const { message } = req.body;
        console.log(message)
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const newmessage = await ChatTable.create({
            senderId: req.user.id,
            message
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