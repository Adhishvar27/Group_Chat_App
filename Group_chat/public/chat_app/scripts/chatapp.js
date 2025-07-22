let GroupId = 100;
const token = localStorage.getItem('token');
const chatsList = document.getElementById('chatsList');
const onlineUsersList = document.getElementById('onlineUsersList');
const grouplist = document.getElementById('groupList');
const addmemberbtn = document.getElementById('addmembersbtn');
const groupTitle = document.getElementById('groupTitle');
const adminOptionsBtn = document.getElementById('adminOptionsBtn');
const groupMembersBtn = document.getElementById('groupMembersBtn');

let currentUserIsAdmin = false;
let currentGroupMembers = [];

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

window.addEventListener('beforeunload', () => {
    const data = JSON.stringify({ token });
    const blob = new Blob([data], { type: 'application/json' });
    navigator.sendBeacon('http://localhost:3000/users/logout', blob);
});

async function initializeApp() {
    try {
        await reloadpage();
        await loadgroupsfromDB();
        loadoldmessagesfromlocalstoage();
        
        setInterval(() => {
            fetchNewMessages();
            getOnlineUsers();
        }, 1000);

        setupEventListeners();
        updateUIForGroup();
        
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function setupEventListeners() {

    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('chatmessage');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendmessagefunction);
    }
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendmessagefunction(e);
            }
        });
    }
    const logoutBtn = document.getElementById('logoutbtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutfunction);
    }

    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', newgroupcreation);
    }

    if (addmemberbtn) {
        addmemberbtn.addEventListener('click', openAddMemberModal);
    }

    if (groupMembersBtn) {
        groupMembersBtn.addEventListener('click', showGroupMembers);
    }

    if (adminOptionsBtn) {
        adminOptionsBtn.addEventListener('click', showAdminOptions);
    }

    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(searchUsers, 300));
    }

    const confirmAddBtn = document.getElementById('confirmAddBtn');
    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', confirmAddMember);
    }
}

async function checkAdminStatus(groupId) {
    if (groupId === 100) {
        currentUserIsAdmin = false;
        return false;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/adminstatus/${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });

        const data = await response.json();
        currentUserIsAdmin = data.isAdmin || false;
        return currentUserIsAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        currentUserIsAdmin = false;
        return false;
    }
}

async function updateUIForGroup() {
    const isAdmin = await checkAdminStatus(GroupId);
    
    if (GroupId === 100) {
        addmemberbtn.style.display = 'none';
        adminOptionsBtn.style.display = 'none';
        groupTitle.textContent = "Common Group";
    } else {
        addmemberbtn.style.display = isAdmin ? 'inline-block' : 'none';
        adminOptionsBtn.style.display = isAdmin ? 'inline-block' : 'none';
    }

    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'table-cell' : 'none';
    });
}

// Open add member modal
async function openAddMemberModal() {
    try {
        await loadNonMembers();
        const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
        modal.show();
    } catch (error) {
        console.error('Error opening add member modal:', error);
        alert('Error loading users');
    }
}

// Load non-members for adding
async function loadNonMembers() {
    try {
        console.log('Sending GroupId to backend:', GroupId); 
        const response = await fetch(`http://localhost:3000/users/nonmembers?groupId=${GroupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });

        const users = await response.json();
        if (!response.ok) {
            console.error('Backend error loading non-members:', users);
            alert(data.message || 'Error loading users');
            return;
        }
        populateUserSelect(users);
    } catch (error) {
        console.error('Error loading non-members:', error);
    }
}

// Search users
async function searchUsers() {
    const query = document.getElementById('userSearch').value.trim();
    
    if (query.length < 2) {
        await loadNonMembers();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/searchusers?groupId=${GroupId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ query, groupId: GroupId })
        });

        const users = await response.json();
        populateUserSelect(users);
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

// Populate user selection dropdown
function populateUserSelect(users) {
    const select = document.getElementById('userSelect');
    select.innerHTML = '';
    console.log(users);
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        option.dataset.phone = user.phone || '';
        select.appendChild(option);
    });
}

// Confirm adding member
async function confirmAddMember() {
    const select = document.getElementById('userSelect');
    const selectedUserId = select.value;

    if (!selectedUserId) {
        alert('Please select a user to add');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/group/addmember', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ userId: parseInt(selectedUserId), groupId: GroupId })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Error adding user');
            return;
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
        modal.hide();
        alert('Member added successfully!');
        
        // Refresh members list if modal is open
        if (document.getElementById('groupMembersModal').classList.contains('show')) {
            await loadGroupMembers();
        }
        
    } catch (error) {
        console.error('Error adding member:', error);
        alert('Error adding member');
    }
}

// Show group members
async function showGroupMembers() {
    await loadGroupMembers();
    const modal = new bootstrap.Modal(document.getElementById('groupMembersModal'));
    modal.show();
}

// Load group members
async function loadGroupMembers() {
    if (GroupId === 100) {
        // For common group, show all users
        await loadAllUsersAsMembers();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/group/members?groupId=${GroupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
         if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from backend:', errorData);
            alert('Failed to load group members: ' + errorData.message);
            return;
        }

        const members = await response.json();
        currentGroupMembers = members;
        populateMembersTable(members);
    } catch (error) {
        console.error('Error loading group members:', error);
    }
}

// Load all users for common group
async function loadAllUsersAsMembers() {
    try {
        const response = await fetch('http://localhost:3000/users/getvalue', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const users = await response.json();
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isOnline: user.isOnline,
            isAdmin: false,
            joinedAt: null
        }));

        populateMembersTable(formattedUsers);
    } catch (error) {
        console.error('Error loading all users:', error);
    }
}

// Populate members table
function populateMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';
    members.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-user me-2"></i>
                    ${member.name}
                </div>
            </td>
            <td>${member.email}</td>
            <td>
                <span class="badge ${member.isOnline ? 'bg-success' : 'bg-secondary'}">
                    ${member.isOnline ? 'Online' : 'Offline'}
                </span>
            </td>
            <td>
                <span class="badge ${member.isAdmin ? 'bg-primary' : 'bg-light text-dark'}">
                    ${member.isAdmin ? 'Admin' : 'Member'}
                </span>
            </td>
            <td class="admin-only" style="display: ${currentUserIsAdmin ? 'table-cell' : 'none'};">
                ${GroupId !== 100 ? createMemberActions(member) : ''}
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Create member action buttons
function createMemberActions(member) {
    const currentUserId = getCurrentUserId();
    
    if (member.id === currentUserId) {
        return '<span class="text-muted">You</span>';
    }

    let actions = '';
    
    if (!member.isAdmin) {
        actions += `
            <button class="btn btn-sm btn-success me-1" onclick="makeAdmin(${member.id})">
                <i class="fas fa-user-shield"></i> Make Admin
            </button>
        `;
    } else if (member.id !== getGroupCreatorId()) {
        actions += `
            <button class="btn btn-sm btn-warning me-1" onclick="removeAdmin(${member.id})">
                <i class="fas fa-user-minus"></i> Remove Admin
            </button>
        `;
    }

    if (member.id !== getGroupCreatorId()) {
        actions += `
            <button class="btn btn-sm btn-danger" onclick="removeMember(${member.id})">
                <i class="fas fa-user-times"></i> Remove
            </button>
        `;
    }

    return actions;
}

// Member management functions
async function makeAdmin(userId) {
    if (!confirm('Make this user an admin?')) return;

    try {
        const response = await fetch('http://localhost:3000/group/makeadmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ userId, groupId: GroupId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('User promoted to admin successfully!');
            await loadGroupMembers();
        } else {
            alert(data.message || 'Error promoting user');
        }
    } catch (error) {
        console.error('Error making admin:', error);
        alert('Error promoting user');
    }
}

async function removeAdmin(userId) {
    if (!confirm('Remove admin privileges from this user?')) return;

    try {
        const response = await fetch('http://localhost:3000/group/removeadmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ userId, groupId: GroupId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Admin privileges removed successfully!');
            await loadGroupMembers();
        } else {
            alert(data.message || 'Error removing admin privileges');
        }
    } catch (error) {
        console.error('Error removing admin:', error);
        alert('Error removing admin privileges');
    }
}

async function removeMember(userId) {
    if (!confirm('Remove this user from the group?')) return;

    try {
        const response = await fetch('http://localhost:3000/group/removemember', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ userId, groupId: GroupId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('User removed from group successfully!');
            await loadGroupMembers();
        } else {
            alert(data.message || 'Error removing user');
        }
    } catch (error) {
        console.error('Error removing member:', error);
        alert('Error removing user');
    }
}

// Show admin options
function showAdminOptions() {
    const modal = new bootstrap.Modal(document.getElementById('adminOptionsModal'));
    modal.show();

    // Set up admin option handlers
    document.getElementById('manageMembers').onclick = () => {
        modal.hide();
        showGroupMembers();
    };

    document.getElementById('promoteMembers').onclick = () => {
        modal.hide();
        showGroupMembers();
    };
}

// Existing functions (updated where necessary)

async function reloadpage() {
    try {
        const response = await fetch('http://localhost:3000/users/markifonline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Something went wrong while loading the page');
        }

        await getOnlineUsers();
    } catch (error) {
        console.error(error.message);
    }
}

async function newgroupcreation(event) {
    event.preventDefault();
    
    const groupname = event.target.groupName.value.trim();
    if (!groupname) {
        alert("Please enter a group name.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/group/creation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({ name: groupname })
        });

        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || 'Error creating group');
            return;
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createGroupModal'));
        modal.hide();
        
        // Reset form
        event.target.reset();
        
        // Add to group list
        addGroupToList(data);
        
        alert('Group created successfully!');
        
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Error creating group');
    }
}

function addGroupToList(group) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const button = document.createElement('button');
    button.className = 'btn btn-light w-100 text-start';
    button.innerHTML = `
        <i class="fas fa-users me-2"></i>
        ${group.name}
        <span class="badge bg-primary ms-2">Admin</span>
    `;
    
    button.addEventListener('click', async () => {
        await switchToGroup(group.id, group.name);
    });
    
    li.appendChild(button);
    grouplist.appendChild(li);
}

async function switchToGroup(groupId, groupName) {
    GroupId = groupId;
    groupTitle.textContent = groupName;
    chatsList.innerHTML = '';
    
    await updateUIForGroup();
    await loadoldmessagesfromlocalstoage();
    await fetchNewMessages();
}

async function loadgroupsfromDB() {
    try {
        const response = await fetch('http://localhost:3000/group/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Something went wrong fetching groups');
        }

        // Clear existing groups
        grouplist.innerHTML = '';

        data.forEach(group => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            
            const button = document.createElement('button');
            button.className = 'btn btn-light w-100 text-start';
            
            const adminBadge = group.isAdmin ? '<span class="badge bg-primary ms-2">Admin</span>' : '';
            button.innerHTML = `
                <i class="fas fa-users me-2"></i>
                ${group.name}
                ${adminBadge}
            `;

            button.addEventListener('click', async () => {
                await switchToGroup(group.id, group.name);
            });

            li.appendChild(button);
            grouplist.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading groups:', error.message);
    }
}

async function loadoldmessagesfromlocalstoage() {
    const chatKey = `chats_${GroupId}`;
    const oldmessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    try {
        const response = await fetch(`http://localhost:3000/app/getMessage?lastmessageid=-1&groupId=${GroupId}`);
        const freshFromDB = await response.json();

        if (freshFromDB.length === 0 && oldmessages.length > 0) {
            chatsList.innerHTML = '';
            localStorage.removeItem(chatKey);
            return;
        }

        chatsList.innerHTML = '';
        oldmessages.forEach(renderChat);
    } catch (error) {
        console.error('Error loading old messages:', error);
    }
}

function renderChat(chat) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const time = new Date(chat.createdAt).toLocaleTimeString();
    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <strong>${chat.name}:</strong>
                <span class="ms-2">${chat.message}</span>
            </div>
            <small class="text-muted">${time}</small>
        </div>
    `;
    
    chatsList.appendChild(li);
}

async function fetchNewMessages() {
    const chatKey = `chats_${GroupId}`;
    let savedchat = JSON.parse(localStorage.getItem(chatKey)) || [];
    const lastId = savedchat.length ? savedchat[savedchat.length - 1].id : -1;

    try {
        const response = await fetch(`http://localhost:3000/app/getMessage?lastmessageid=${lastId}&groupId=${GroupId}`);
        const messages = await response.json();

        if (!Array.isArray(messages)) {
            return;
        }

        const merged = [...savedchat, ...messages.filter(
            msg => !savedchat.some(old => old.id === msg.id)
        )].slice(-10);

        localStorage.setItem(chatKey, JSON.stringify(merged));
        
        if (messages.length > 0) {
            chatsList.innerHTML = '';
            merged.forEach(renderChat);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function sendmessagefunction(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('chatmessage');
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/app/messagestore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({
                message: messageText,
                GroupId: GroupId
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageInput.value = '';
            
            const newMsg = {
                id: data.id,
                name: data.name,
                message: data.message,
                createdAt: data.createdAt
            };

            renderChat(newMsg);

            const chatKey = `chats_${GroupId}`;
            const chats = JSON.parse(localStorage.getItem(chatKey)) || [];
            const updated = [...chats, newMsg].slice(-10);
            localStorage.setItem(chatKey, JSON.stringify(updated));
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function getOnlineUsers() {
    try {
        const response = await fetch('http://localhost:3000/users/getvalue');
        const users = await response.json();

        onlineUsersList.innerHTML = '';

        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a class="dropdown-item d-flex justify-content-between align-items-center" href="#">
                    <span>
                        <i class="fas fa-user me-2"></i>
                        ${user.name}
                    </span>
                    <span class="badge ${user.isOnline ? 'bg-success' : 'bg-secondary'}">
                        ${user.isOnline ? 'Online' : 'Offline'}
                    </span>
                </a>
            `;
            onlineUsersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching online users:', error);
    }
}

async function logoutfunction(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('http://localhost:3000/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Something went wrong while logging out');
        }

        localStorage.clear();
        window.location.href = '../login.html';
    } catch (error) {
        alert(error.message);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getCurrentUserId() {
    try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.userId;
    } catch (error) {
        return null;
    }
}

function getGroupCreatorId() {
    // This should be stored when loading groups or passed from server
    return null; // Implement as needed
}

// Make functions available globally for onclick handlers
window.makeAdmin = makeAdmin;
window.removeAdmin = removeAdmin;
window.removeMember = removeMember;
