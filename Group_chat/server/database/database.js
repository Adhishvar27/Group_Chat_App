const {Sequelize}=require('sequelize');

const database=new Sequelize('group_chat_app','root','root',{
    dialect:'mysql',
    host:'localhost'
});

(async()=>{try {
    await database.authenticate();
    console.log('Connection made successfully');
} catch (error) {
    console.log(error);
    
}})();

module.exports=database;