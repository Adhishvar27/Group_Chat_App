const {Sequelize,DataTypes}=require('sequelize');
const database=require('../database/database');

const usersgroups=database.define('usersgroups',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false 
    },
    groupId:{
        type:DataTypes.INTEGER,
        allowNull:false

    }
});
module.exports=usersgroups
