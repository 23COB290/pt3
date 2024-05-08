
const CHANNEL_TYPE_DM = 0;
const CHANNEL_TYPE_GROUP = 1;

const MESSAGE_TYPE_MESSAGE = 0;
const MESSAGE_TYPE_ADDED = 1;
const MESSAGE_TYPE_LEAVE = 2;
const MESSAGE_TYPE_NEW_GROUP = 3;
const MESSAGE_TYPE_REMOVED = 4;

import { left } from "../global-topbar.js";
import * as global from "../global-ui.js"


const channelList = document.getElementById('channel-list-wrapper');

const channelDetails = document.getElementById('channel-details');
const channelName = channelDetails.querySelector('.channel-name');
const channelMembers = channelDetails.querySelector('.channel-members');
const channelIcon = channelDetails.querySelector('#channel-icon-wrapper');
const channelMessages = channelDetails.querySelector('.channel-messages');
const messageInput = channelDetails.querySelector('#message-input');

const noSelectedChannel = document.getElementById('no-selected-channel');

const newChannelButton = document.getElementById('new-channel');

const channelMap = new Map();

var currentSelectedChannel = null;


newChannelButton.addEventListener('click', () => {
    newChannelPopup();
});


async function newChannelPopup() {

    const recipients = new Set();
    let channelType = CHANNEL_TYPE_DM;
    let groupName;

    const callback = (ctx) => {

        ctx.content.classList.add('new-channel-modal');
        ctx.actionButton.classList.add('disabled');


        ctx.content.innerHTML = `

            <div id="group-name-wrapper" class="disabled tooltip tooltip-under">
                <div class="popup-subtitle">Group name</div>
                <input class="search white disabled" type="text" id="group-name" autocomplete="off">
                <p id="group-name-tooltip" class="tooltiptext">Add more recipients to name a group chat</p>
            </div>


            <div class="popup-subtitle">Recipients</div>
            <div class="search-wrapper">
                <div class="search" tabindex="0">
                    <input id="recipient-search" class="search-input" placeholder="Search Recipients" type="text">
                    <div class="search-icon">
                        <span class="material-symbols-rounded">search</span>
                    </div>
                </div>
                <div class="search-results">

                </div>
            </div>
            <div class="recipient-wrapper">
                <div id="recipient-placeholder">No recipients</div>
                <div id="recipient-list" class="norender">
                    
                </div>
            </div>
        `

        const recipientSearch = ctx.content.querySelector('#recipient-search');
        const searchResults = ctx.content.querySelector('.search-results');
        groupName = ctx.content.querySelector('#group-name');
        const groupNameWrapper = ctx.content.querySelector('#group-name-wrapper');
        const groupNameTooltip = ctx.content.querySelector('#group-name-tooltip');
        const recipientList = ctx.content.querySelector('#recipient-list');
        const recipientPlaceholder = ctx.content.querySelector('#recipient-placeholder');


        const updateChannelDetails = () => {

            // set type and enable name if group chat
            if (recipients.size > 1) {
                channelType = CHANNEL_TYPE_GROUP;
                groupNameWrapper.classList.remove('disabled');
                groupNameTooltip.classList.add('norender');
            } else {
                channelType = CHANNEL_TYPE_DM;
                groupNameWrapper.classList.add('disabled');
                groupNameTooltip.classList.remove('norender');
            }

            // disable create button if no recipients
            // and show placeholder text
            if (recipients.size === 0) {
                recipientPlaceholder.classList.remove('norender');
                recipientList.classList.add('norender');
                ctx.actionButton.classList.add('disabled');
            } else {
                recipientPlaceholder.classList.add('norender');
                recipientList.classList.remove('norender');
                ctx.actionButton.classList.remove('disabled');
            }

        }

        const renderRecipientInList = (emp) => {
            let emp_name = global.employeeToName(emp);
            let emp_icon = global.employeeAvatarOrFallback(emp);
            let listItem = document.createElement("div");
            listItem.classList.add("employee-list-item");
            listItem.classList.add("tooltip", "tooltip-under");
            listItem.innerHTML = `
                <div class="icon-overlay-container avatar">
                    <img src="${emp_icon}" class="avatar">
                    <span class="material-symbols-rounded">close</span>
                </div>
                <p class="tooltiptext">Remove ${emp_name}</p>
            `;
            recipientList.appendChild(listItem);
    
            listItem.addEventListener("pointerup", (e) => {
                e.stopPropagation();
                recipients.delete(emp.empID);
                recipientList.removeChild(listItem);
                updateChannelDetails();
            });
        }

        const searcher = new global.ReusableRollingTimeout(async () => {
            const res = await get_api(`/employee/employee.php/all?q=${recipientSearch.value}`);
            if (!res.success) {
                return;
            }
            const employees = res.data.employees;

            searchResults.replaceChildren();

            employees.forEach((emp) => {
                const elem = renderChannelMember(emp);
                elem.addEventListener('pointerup', () => {
                    if (recipients.has(emp.empID)) {
                        return;
                    }
                    recipients.add(emp.empID);
                    renderRecipientInList(emp);
                    updateChannelDetails();
                });
                searchResults.appendChild(elem);
            });

            
        }, 150);

        searcher.roll();

        recipientSearch.addEventListener('input', () => {
            searcher.roll();
        });

    }


    await global.popupModal(
        false,
        "New DM or Group Chat",
        callback,
        { text:"Create", "class":"blue"}
    );

    let body = {
        type: channelType,
    };

    if (channelType === CHANNEL_TYPE_GROUP) {
        body.name = groupName.value ? groupName.value : null;
        body.recipients = [...recipients];
    } else {
        body.recipient = [...recipients][0];
        body.name = null;
    }


    const res = await post_api("/chat/channel.php/channel", body);

    if (res.success) {
        fetchAndRenderChannels();
    } else {
        global.popupAlert(
            "Unable to create channel",
            `The following error occurred: ${res.error.message} (${res.error.code})`,
            "error"
        );
    }

}


// displays channel icon of chat
function renderChannelIcon(channel) {
    switch (channel.type) {
        case CHANNEL_TYPE_DM:
            let wrapper = document.createElement('div');
            wrapper.classList.add('channel-icon');
            var icon = document.createElement('img');
            icon.src = global.employeeAvatarOrFallback(channel.recipient);
            icon.alt = getChannelName(channel);
            icon.classList.add('channel-icon', 'avatar');
            wrapper.appendChild(icon);
            return wrapper;
        case CHANNEL_TYPE_GROUP:
            var icon = document.createElement('span');
            icon.classList.add('channel-icon', 'group-icon', 'material-symbols-rounded', 'avatar');

            // take last 3 digits to avoid fp rounding errors
            const colour = Number("0x" + channel.channelID.substr(-3)) % 5;

            icon.classList.add(`colour-${colour}`);

            icon.textContent = "group"

            return icon
    }
}

function getChannelName(channel) {
    if (channel.type === CHANNEL_TYPE_DM) {
        return global.employeeToName(channel.recipient);

    }

    if (channel.name) {
        return channel.name;
    }

    return channel.richMembers.map((emp) => global.employeeToName(emp)).join(", ");
    
}

// displays members in chat
function renderChannelMember(emp, isOwner = false) {

    const name = global.employeeToName(emp);
    const avatar = global.employeeAvatarOrFallback(emp);

    const channelMember = document.createElement('div');
    channelMember.classList.add('channel-member');

    const avatarElem = document.createElement('img');
    avatarElem.classList.add('channel-member-avatar', 'avatar');
    avatarElem.src = avatar;
    avatarElem.alt = name;

    const nameElem = document.createElement('div');
    nameElem.classList.add('channel-member-name');
    nameElem.textContent = name;

    channelMember.appendChild(avatarElem);
    channelMember.appendChild(nameElem);

    if (isOwner) {
        const icon = document.createElement('span');
        icon.classList.add('material-symbols-rounded', 'owner-icon');
        icon.textContent = "star";
        channelMember.appendChild(icon);
    }

    return channelMember;
}

// displays chats in chat list
function renderChannelInList(channel, members) {

    const element = document.createElement('a');
    element.classList.add('channel');
    element.href = `#${channel.channelID}`
    element.id = `channel-${channel.channelID}`;

    const icon = renderChannelIcon(channel);
    
    const details = document.createElement('div');
    details.classList.add('channel-details');

    const name = document.createElement('div');
    name.classList.add('channel-name');
    name.textContent = getChannelName(channel);

    const preview = document.createElement('div');
    preview.classList.add('channel-preview');
    preview.textContent = 'last message';

    details.appendChild(name);
    details.appendChild(preview);

    const actions = document.createElement('div');
    actions.classList.add('channel-actions');

    const close = document.createElement('span');
    close.classList.add('material-symbols-rounded');

    close.textContent = "close"

    close.addEventListener('pointerup', async (e) => {

        if (e.button !== 0) {
            return;
        }


        if (channel.type != CHANNEL_TYPE_DM) {
            await confirmLeave(getChannelName(channel));
        }

        const res = await delete_api(`/chat/channel.php/list/${channel.channelID}`);

        if (res.success) {
            element.remove();
            setChannelDetailsVisiblity(false);
            return;
        }

        global.popupAlert(
            "Unable to delete channel",
            `The following error occurred: ${res.error.message} (${res.error.code})`,
            "error"
        );
    });

    element.addEventListener('click', (event) => {
        // stop rendering if clicked on close button
        if (event.target === close) {
            event.preventDefault();
        }

        // stop rendering if already selected
        if (element.classList.contains('selected')) {
            event.preventDefault();
        }
    });

    actions.appendChild(close);

    element.appendChild(icon);
    element.appendChild(details);
    element.appendChild(actions);

    return element;
}

async function fetchAndRenderChannels() {

    const res = await get_api("/chat/channel.php/list");

    if (!res.success) {
        return;
    }
    // removes chats from list
    channelList.replaceChildren();

    const me = (await global.getCurrentSession()).employee;

    const channels = res.data.channels;

    const uniqueEmployees = new Set();

    for (const channel of channels) {
        for (const member of channel.members) {
            uniqueEmployees.add(member);
        }
    }

    const employees = await global.getEmployeesById([...uniqueEmployees]);

    

    for (const channel of channels) {

        const members = [];
        for (const id of channel.members) {
            members.push(employees.get(id));

            if (id !== me.empID && channel.type === CHANNEL_TYPE_DM) {
                channel.recipient = employees.get(id);
            }
        }

        channel.richMembers = members;
        channelMap.set(channel.channelID, channel);

        channelList.appendChild(renderChannelInList(channel, members));
    }

    // render initial after we have fetched channels
    global.dispatchBreadcrumbnavigateEvent("initial")

}

fetchAndRenderChannels();

// determines if no channel selected message appears or if channel appears
function setChannelDetailsVisiblity(visible) {
    if (visible) {
        channelDetails.classList.remove('norender');
        noSelectedChannel.classList.add('norender');
    } else {
        noSelectedChannel.classList.remove('norender');
        channelDetails.classList.add('norender');
    }
}



async function renderIndividualChannel(channelID) {


    const channel = channelMap.get(channelID);
    const name = getChannelName(channel);

    if (!channel) {
        return;
    }

    channelMessages.replaceChildren();

    messageInput.setAttribute("placeholder", `Message ${name}`)

    currentSelectedChannel = channel;
    // renders messages in selected channel and scrolls to bottom
    fetchAndRenderMessages(channelID).then(scrollMessagesToBottom);

    // displays new breadcrumb on page
    global.setBreadcrumb(["Chats", name], ["./", `#${channelID}`])
    setChannelDetailsVisiblity(true);

    document.querySelectorAll(".channel.selected").forEach((elem) => {
        elem.classList.remove('selected');
    });

    // updates visual of chat on chat list
    const listElement = document.getElementById(`channel-${channelID}`);
    if (listElement) {
        listElement.classList.add('selected');
        listElement.scrollIntoView({ block: "nearest" });
    }

    channelName.textContent = name;

    channelIcon.replaceChildren(renderChannelIcon(channel));
    // clears channel members from previous chat
    channelMembers.replaceChildren();
    //adds members to channelMembers
    for (const member of channel.richMembers) {
        channelMembers.appendChild(renderChannelMember(
            member,
            channel.type == CHANNEL_TYPE_GROUP && member.empID == channel.owner.empID
        ));
    }

}

async function fetchAndRenderMessages(channelID) {
    // gets messages from api for the current chat
    const res = await get_api(`/chat/message.php/messages/${channelID}`);

    if (!res.success) {
        return;
    }
    // removes messages from previous chat from channelMessages
    channelMessages.replaceChildren();

    const messages = res.data.messages;

    // todo bulk messages together
    for (const message of messages) {
        renderMessage(message);
    }

}

let editingMsg = false
let messageBeingEdited

//displays the selected message to the user
async function renderMessage(message) {

    lastMessageTimestamp = message.createdAt;

    if (document.getElementById(`message-${message.msgID}`)) {
        return;
    }

    //makes the div for the message
    const messageElement = document.createElement('div');
    messageElement.id = `message-${message.msgID}`;
    messageElement.classList.add('message');

    const leftWrapper = document.createElement('div');
    leftWrapper.classList.add('message-left-wrapper');


    //adds the avatar to the message
    const avatar = document.createElement('img');
    avatar.src = global.employeeAvatarOrFallback(message.author);
    avatar.alt = global.employeeToName(message.author);
    avatar.classList.add('avatar', 'message-avatar');

    //wrapper for the message details and content
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('message-content-wrapper');

    //details include author name, date and time
    //TO DO: ADD DATE AND TIME
    const details = document.createElement('div');
    details.classList.add('message-details');
    const author = document.createElement('div');
    author.classList.add('message-author');
    author.textContent = global.employeeToName(message.author);
    
    details.appendChild(author);

    const createdAt = global.howLongAgo(message.createdAt);

    details.appendChild(renderMessageTimestamp(createdAt));

    if (message.editedAt) {
        const editedAt = global.howLongAgo(message.editedAt);
        details.appendChild(renderMessageTimestamp(`edited ${editedAt}`));
        messageElement.classList.add('edited');
    }

    //content of the messages

    contentWrapper.appendChild(details);


    const content = document.createElement('div');
    content.classList.add('message-content');


    if (message.type != MESSAGE_TYPE_MESSAGE) {
        messageElement.classList.add("system")
        details.insertBefore(content, details.childNodes[1]);

    } else {
        contentWrapper.appendChild(content);
    }

    switch (message.type) {
        case MESSAGE_TYPE_MESSAGE:
            content.innerText = message.content;
            break;
        
        case MESSAGE_TYPE_NEW_GROUP:
            content.innerText = "created this group"
            break;
        
        case MESSAGE_TYPE_ADDED:
            let added = "placeholder";
            content.innerText = `added ${added} to the group`;
            break;
        
        case MESSAGE_TYPE_LEAVE:
            content.innerText = "left the group";
            break;
        case MESSAGE_TYPE_REMOVED:
            let removed = "placeholder";
            content.innerText = `removed ${removed} from the group`;
            break;

    }


    leftWrapper.appendChild(avatar);
    leftWrapper.appendChild(contentWrapper);

    messageElement.appendChild(leftWrapper);

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('message-buttons');

    // adds buttons to message e.g. edit, delete

    const session = await global.getCurrentSession();

    if (session.employee.empID != message.author.empID || message.type != MESSAGE_TYPE_MESSAGE) {
        channelMessages.appendChild(messageElement);
        return;
    }

    buttonWrapper.innerHTML = `<div class="icon-button no-box edit">
        <div class="button-icon">
            <span class="material-symbols-rounded">edit</span>
        </div>
    </div>
    <div class="icon-button no-box delete modal-skippable">
        <div class="button-icon">
            <span class="material-symbols-rounded">delete</span>
        </div>
    </div>`
    

    messageElement.appendChild(buttonWrapper);

    const deleteButton = messageElement.querySelector('.delete');
    deleteButton.addEventListener('pointerup', async () => {


        await confirmDelete();


        // delete message on backend
        const res = await delete_api(`/chat/message.php/message/${message.channel.channelID}/${message.msgID}`);

        if (res.success) {
            // remove message from browser view
            messageElement.remove();
            return;
        }
        global.popupAlert(
            "Unable to delete message",
            `The following error occurred: ${res.error.message} (${res.error.code})`,
            "error"
        );
    });

    const editButton = messageElement.querySelector('.edit');
    editButton.addEventListener('pointerup', async () => {
        //display edit message interface
        let currentMsgContent = messageElement.querySelector('.message-content').innerText
        messageInput.innerHTML = currentMsgContent
        editingMsg = true
        console.log(editingMsg)
        messageBeingEdited = message
    });

    channelMessages.appendChild(messageElement);
    
}

function renderMessageTimestamp(text) {
    const element = document.createElement('div');
    element.classList.add('message-timestamp');
    element.textContent = text;
    return element;
}


// uses the breadcrumb to navigate to a chat page
async function renderFromBreadcrumb(locations) {

    global.setBreadcrumb(["Chats"], ["./"])


    if (locations.length === 0) {
        setChannelDetailsVisiblity(false);
        return;
    }

    const channelID = locations[0];
    renderIndividualChannel(channelID);
}

window.addEventListener("breadcrumbnavigate", (e) => {
    renderFromBreadcrumb(e.locations);
});

messageInput.addEventListener("keydown", async (event) => {
    // ignore keys that aren't enter or if shift is held
    if (event.key !== "Enter" || event.shiftKey) {
        return;
    }

    event.preventDefault();
    
    // we dont need to worry about safety as it is rendered with innerText
    const content = messageInput.innerHTML.trim().replaceAll("<br>", "\n");

    console.log(editingMsg)
    if (!editingMsg) {
        // makes api request, sends new message to server
        const res = await post_api(`/chat/message.php/message/${currentSelectedChannel.channelID}`, {
            content: content
        });

        // if sending is successful, display message
        if (res.success) {
            messageInput.textContent = "";

            let message = res.data;

            message.author = (await global.getCurrentSession()).employee;

            moveSelectedChannelToTop();

            await renderMessage(res.data);
            scrollMessagesToBottom();
            return;
        }
        // display error to user
        global.popupAlert(
            "Unable to send message",
            `The following error occurred: ${res.error.message} (${res.error.code})`,
            "error"
        );
    } else {
        // edit the selected message
        const res = await patch_api(`/chat/message.php/message/${currentSelectedChannel.channelID}/${messageBeingEdited.msgID}`, {
            content: content
        });

        // if sending is successful, change displayed message
        if (res.success) {
            //change content of message element.
            document.querySelector(`#message-${messageBeingEdited.msgID} .message-content`).innerText = content
            messageInput.textContent = "";
            editingMsg = false
            messageBeingEdited = null
            return;
        }

        // display error to user
        global.popupAlert(
            "Unable to edit message",
            `The following error occurred: ${res.error.message} (${res.error.code})`,
            "error"
        );
    }

});

function scrollMessagesToBottom() {
    channelMessages.scrollTop = channelMessages.scrollHeight;
}

function moveSelectedChannelToTop() {
    const listElement = document.querySelector('.channel.selected');
    if (listElement) {
        channelList.prepend(listElement);
    }
}

function confirmDelete() {

    const callback = (ctx) => {
        ctx.content.innerHTML = `
        <div class="popup-text">Are you sure you want to delete this message?</div>
        <div class="popup-text">This will delete this message for everyone</div>
        `
    }

    return global.popupModal(
        true,
        "Delete message",
        callback,
        {
            text: "Delete",
            class: "red",
        }
    )
}

function confirmLeave(name) {

    const callback = (ctx) => {
        ctx.content.innerHTML = `
        <div class="popup-text">You will no longer be able to see or send messages in this group chat</div>
        `
    }

    return global.popupModal(
        false,
        `Leave ${name}?`,
        callback,
        {
            text: "Leave",
            class: "red",
        }
    )

}

let lastMessageTimestamp = 0;

async function messageRefresher() {

    // dont refresh if no channel selected
    if (!noSelectedChannel.classList.contains('norender')) {
        return;
    }

    const res = await get_api(`/chat/message.php/messages/${currentSelectedChannel.channelID}?after=${lastMessageTimestamp}`);

    if (!res.success) {
        return;
    }

    const messages = res.data.messages;

    for (const message of messages) {
        renderMessage(message);
    }

}

setInterval(messageRefresher, 1000);
