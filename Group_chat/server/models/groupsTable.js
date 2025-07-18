const {Sequelize,DataTypes}=require('sequelize');
const database=require('../database/database');

const grouptable=database.define('groups',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    admin:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
})
module.exports=grouptable;
