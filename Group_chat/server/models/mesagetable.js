const database=require('../database/database');
const {Sequelize,DataTypes}=require('sequelize');


const chattable=database.define('chats',{
    id:{
        primaryKey:true,
        type:DataTypes.INTEGER,
        autoIncrement:true
    },
    senderId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    }
});

module.exports=chattable