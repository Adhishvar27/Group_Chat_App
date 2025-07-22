const UserTable=require('./userTable');
const ChatTable=require('./mesagetable');
const GroupsTable=require('./groupsTable');
const UsersGroups=require('./usersgroups');

UserTable.hasMany(ChatTable,{foreignKey:'senderId'});
ChatTable.belongsTo(UserTable,{foreignKey:'senderId'});


UserTable.belongsToMany(GroupsTable,{through:UsersGroups,foreignKey:'userId'});
GroupsTable.belongsToMany(UserTable,{through:UsersGroups,foreignKey:'groupId'});

UsersGroups.belongsTo(GroupsTable, {foreignKey: 'groupId',as: 'group'});
UsersGroups.belongsTo(UserTable, {foreignKey: 'userId',as: 'user'});

module.exports={
    UserTable,
    ChatTable,
    GroupsTable,
    UsersGroups
}