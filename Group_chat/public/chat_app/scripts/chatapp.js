
const token = localStorage.getItem('token');
const chatsList = document.getElementById('chatsList');
const dropdownMenu = document.querySelector('.dropdown-menu');

window.addEventListener('DOMContentLoaded', () => {
    getuserslist();
    loadoldmessagesfromlocalstoage();
    setInterval(()=>{
        fetchNewMessages();
        getuserslist();
    }, 1000);
    const sendmessgae = document.getElementById('sendBtn');
    if (sendmessgae) {
        sendmessgae.addEventListener('click', sendmessagefunction);
    }

});

function loadoldmessagesfromlocalstoage() {
    chatsList.innerHTML = '';
    const oldmessages = JSON.parse(localStorage.getItem('chats')) || [];
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
    const savedchat = JSON.parse(localStorage.getItem('chats')) || [];
    const lastId = savedchat.length ? savedchat[savedchat.length - 1].id : -1;
    try {
        const response = await fetch(`http://localhost:3000/app/getMessage?lastmessageid=${lastId}`);
        const newmessage = await response.json();
        if (newmessage && newmessage.length > 0) {
            chatsList.innerHTML = '';
            newmessage.forEach(renderChat);
            const mergeMessage = [...savedchat, ...newmessage].slice(-10);
            localStorage.setItem('chats', JSON.stringify(mergeMessage));
        }

    } catch (error) {
        console.error('Error fetching new messages:', error);
    }
}


async function sendmessagefunction(event) {
    event.preventDefault();
    const messageInput = document.getElementById('chatmessage');
    const message = { message: messageInput.value };
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
        const chats = JSON.parse(localStorage.getItem('chats')) || [];
        const updated = [...chats, newMsg].slice(-10);
        localStorage.setItem('chats', JSON.stringify(updated));
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

    }
}

