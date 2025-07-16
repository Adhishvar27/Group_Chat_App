
const token=localStorage.getItem('token');
window.addEventListener('DOMContentLoaded', () => {
    loadchats();
    //usermessage();
    const sendmessgae=document.getElementById('sendBtn');
    if(sendmessgae){
        sendmessgae.addEventListener('click',sendmessagefunction);
    }

});

// function usermessage(){

// }

const chatsList = document.getElementById('chatsList');

async function loadchats() {
    try {
        const response = await fetch('http://localhost:3000/app/groupchats');
        const data = await response.json();
        if (!response.ok) {
            alert('failed to load the chats');
        }
        console.log(data);
        data.chats.forEach(chat => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<strong>${chat.user.name}:</strong> ${chat.message}`;
            chatsList.appendChild(li);
        });
    } catch (error) {
        console.log(error);
    }
}

async function sendmessagefunction(event) {
    try {
        const messageInput = document.getElementById('chatmessage');
        const message={
            message:messageInput.value
        };
        const response=await fetch('http://localhost:3000/app/messagestore',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`${token}`
            },
            body:JSON.stringify(message)
        });
        messageInput.value = ''
        const data=await response.json();
        const li=document.createElement('li');
        li.className='list-group-item';
        li.innerHTML=`<strong>${data.name}:</strong> ${data.message}`;
        chatsList.appendChild(li);
        loadchats();

    } catch (error) {
        console.log(error);
    }
}

