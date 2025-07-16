const UserTable=require('./userTable');
const ChatTable=require('./mesagetable');

UserTable.hasMany(ChatTable,{foreignKey:'senderId'});
ChatTable.belongsTo(UserTable,{foreignKey:'senderId'});

module.exports={
    UserTable
}