const express = require('express');
const db = require('./database/database');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
require('./models');
app.use(express.static(path.join(__dirname, '../public')));

const UserRouter = require('./routers/usersRouters');
app.use('/users', UserRouter);

const ChatRouter = require('./routers/chatsRouter');
app.use('/app', ChatRouter);

const groupRouter = require('./routers/groupsRouter');
app.use('/group', groupRouter);

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'signUp.html'));
})

db.sync({ alter: true }).then(() => {  
    app.listen(3000, () => {
        console.log('server is running');
    });
}).catch((error) => {
    console.log('Error While creating the database', error);
})
