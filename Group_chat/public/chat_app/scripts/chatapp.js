let GroupId=100;
let commongroup=true;
const token = localStorage.getItem('token');
const chatsList = document.getElementById('chatsList');
const dropdownMenu = document.querySelector('.dropdown-menu');
const grouplist=document.getElementById('groupList');
const commongrpbtn=document.getElementById('commongrpbtn')
if (commongrpbtn) {
  commongrpbtn.addEventListener('click', () => {
    const chatKey = `chats_${GroupId}`;
    GroupId = 100;
    chatsList.innerHTML = '';
    localStorage.removeItem(chatKey);
    fetchNewMessages();
  });
}

window.addEventListener('beforeunload',()=>{
    const data = JSON.stringify({ token });
    const blob = new Blob([data], { type: 'application/json' });
   navigator.sendBeacon('http://localhost:3000/users/logout',blob);
})

async function logoutfunction(e){
    e.preventDefault();
    try {
        const response=await fetch('http://localhost:3000/users/logout',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
        const data=await response.json();
        if(!response.ok){
            throw new Error('Something went wrong while Logging Out');
        }
        localStorage.clear();
        window.location.href=`../login.html`;
    } catch (error) {
        alert(error.message);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    getuserslist();
    reloadpage();
    loadgroupsfromDB();
    loadoldmessagesfromlocalstoage();
    setInterval(()=>{
        fetchNewMessages();
        getuserslist();
    },20000);
    const sendmessgae = document.getElementById('sendBtn');
    if (sendmessgae) {
        sendmessgae.addEventListener('click', sendmessagefunction);
    }
    const logout=document.getElementById('logoutbtn');
    if(logout){
        logout.addEventListener('click',logoutfunction);
    }
    const newgroupform=document.getElementById('createGroupForm');
    if(newgroupform){
        newgroupform.addEventListener('submit',newgroupcreation);
    }
});

async function reloadpage(){
    try {
        const response=await fetch('http://localhost:3000/users/markifonline',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
        if(!response.ok){
            throw new Error('Something went wrong while loading the page');
        }
        getuserslist();
    } catch (error) {
        console.error(error.message);
    }
}

async function newgroupcreation(event){
    event.preventDefault();
    const chatKey = `chats_${GroupId}`;
    const groupname = event.target.groupName.value;

    if (!groupname) {
        alert("Please enter a group name.");
        return;
    }

    const myObj = { name: groupname };
     try {
        const response=await fetch('http://localhost:3000/group/creation',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body:JSON.stringify(myObj)
        });
        const data=await response.json();
        if(!response.ok){
            throw new Error('Error while creting the group');
        }
        console.log('Group created:', data); 
        const li=document.createElement('li');
        li.className = 'list-group-item';
        const button = document.createElement('button');
        button.className = 'btn btn-light w-100 text-start';
        button.textContent = data.name;
        button.addEventListener('click',()=>{
            GroupId = data.id; 
            chatsList.innerHTML = ''; 
            localStorage.removeItem(chatKey);
            fetchNewMessages();
        });
        li.appendChild(button);
        grouplist.appendChild(li);

     } catch (error) {
         console.error('Error creating group:', error);
     }
}

async function loadgroupsfromDB(){
    try {
        const response=await fetch('http://localhost:3000/group/all');
        const data= await response.json();
        if(!response.ok){
            throw new Error('somthing went wrong in fetching the groups');
        }
        data.forEach(group => {
        const li=document.createElement('li');
        li.className = 'list-group-item';
        const button = document.createElement('button');
        button.className = 'btn btn-light w-100 text-start'
        button.textContent = group.name;
        button.addEventListener('click',()=>{
            GroupId = group.id; 
            chatsList.innerHTML = ''; 
            localStorage.removeItem('chats');
            fetchNewMessages();
        });
        li.appendChild(button);
        grouplist.appendChild(li);
        });
    } catch (error) {
        console.error(error.message);
    }
}

async function loadoldmessagesfromlocalstoage() {
    const chatKey = `chats_${GroupId}`
    const oldmessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    const response = await fetch(`http://localhost:3000/app/getMessage?lastmessageid=-1&groupId=${GroupId}`);
    const freshFromDB = await response.json();
    if (freshFromDB.length === 0 && oldmessages.length > 0) {
        localStorage.removeItem(chatKey);
        chatsList.innerHTML = '';    
        return;
    }

    chatsList.innerHTML = '';
    oldmessages.forEach(renderChat);
}

function renderChat(chat) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `<strong>${chat.name}:</strong> ${chat.message}
  <br><small class="text-muted">${new Date(chat.createdAt).toLocaleTimeString()}</small>`;
    chatsList.appendChild(li);
}

async function fetchNewMessages() {
     const chatKey = `chats_${GroupId}`;
    const savedchat = JSON.parse(localStorage.getItem(chatKey)) || [];
    //const lastId = savedchat.length ? savedchat[savedchat.length - 1].id : -1;
    try {
        console.log(GroupId);
        const response = await fetch(`http://localhost:3000/app/getMessage?lastmessageid=-1&groupId=${GroupId}`);
        const newmessage = await response.json();
        console.log(newmessage);
        if (newmessage && newmessage.length > 0) {
            chatsList.innerHTML = '';
            newmessage.forEach(renderChat);
            const mergeMessage = [...savedchat, ...newmessage].slice(-10);
            localStorage.setItem(chatKey, JSON.stringify(mergeMessage));
        }

    } catch (error) {
        console.error('Error fetching new messages:', error);
    }
}


async function sendmessagefunction(event) {
    event.preventDefault();
    const chatKey = `chats_${GroupId}`;
    const messageInput = document.getElementById('chatmessage');
    const message = { 
        message: messageInput.value,
        GroupId:GroupId
     };
    try {
        const response = await fetch('http://localhost:3000/app/messagestore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(message)
        });

        const data = await response.json();
        messageInput.value = '';
        const newMsg = {
            id: data.id,
            name: data.name,
            message: data.message,
            createdAt: data.createdAt
        };
        renderChat(newMsg);
        const chats = JSON.parse(localStorage.getItem(chatKey)) || [];
        const updated = [...chats, newMsg].slice(-10);
        localStorage.setItem(chatKey, JSON.stringify(updated));
    }
    catch (error) {
        console.error('Error sending message:', error);
    }

}

async function getuserslist() {
    try {
        const response = await fetch('http://localhost:3000/users/getvalue');
        const data = await response.json();
        if (!response.ok) {
            throw new Error('something went wrong in backend');
        }
        dropdownMenu.innerHTML = ''; 
        data.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = ` <span class="dropdown-item d-flex justify-content-between">
            <span>${user.name}</span>
            <span class="badge ${user.isOnline ? 'bg-success' : 'bg-secondary'}">
            ${user.isOnline ? 'Online' : 'Offline'}
            </span>
            </span>`
            dropdownMenu.appendChild(li);
        });

    } catch (error) {
        console.log(error)
    }
}

