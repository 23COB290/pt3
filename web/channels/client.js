
const CHANNEL_TYPE_DM = 0;
const CHANNEL_TYPE_GROUP = 1;
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
        body.name = groupName.value ?? null;
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
    } else {
        return channel.name;
    }
}


function renderChannelMember(emp) {

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

    return channelMember;
}

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

    currentSelectedChannel = channel;

    fetchAndRenderMessages(channelID).then(scrollMessagesToBottom);


    global.setBreadcrumb(["Chats", name], ["./", `#${channelID}`])
    setChannelDetailsVisiblity(true);

    document.querySelectorAll(".channel.selected").forEach((elem) => {
        elem.classList.remove('selected');
    });

    const listElement = document.getElementById(`channel-${channelID}`);
    if (listElement) {
        listElement.classList.add('selected');
        listElement.scrollIntoView({ block: "nearest" });
    }

    channelName.textContent = name;

    channelIcon.replaceChildren(renderChannelIcon(channel));

    channelMembers.replaceChildren();

    for (const member of channel.richMembers) {
        channelMembers.appendChild(renderChannelMember(member));
    }

}

async function fetchAndRenderMessages(channelID) {
    const res = await get_api(`/chat/message.php/messages/${channelID}`);

    if (!res.success) {
        return;
    }

    channelMessages.replaceChildren();

    const messages = res.data.messages;

    // todo bulk messages together
    for (const message of messages) {
        renderMessage(message);
    }

}

//displays the selected message to the user
async function renderMessage(message) {
    //makes the div for the message
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

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

    //content of the messages
    const content = document.createElement('div');
    content.classList.add('message-content');
    content.innerText = message.content;


    contentWrapper.appendChild(details);
    contentWrapper.appendChild(content);


    messageElement.appendChild(avatar);
    messageElement.appendChild(contentWrapper);

    channelMessages.appendChild(messageElement);


    // messageElement.innerHTML = `
    //     <div class="personal-main">
    //         <div class="personal-content">
    //             <div class="personal-title">
    //                 <div class="title-text">
    //                     ${personal.title}
    //                 </div>
    //             </div>
    //         </div>
            
    //         <div class="personal-icons">
    //             <div class="icon-button no-box edit">
    //                 <div class="button-icon">
    //                     <span class="material-symbols-rounded">edit</span>
    //                 </div>
    //             </div>
    //             <div class="icon-button no-box delete modal-skippable">
    //                 <div class="button-icon">
    //                     <span class="material-symbols-rounded">delete</span>
    //                 </div>
    //             </div>
    //         </div>
            
    //         <div class="text-button blue save norender">
    //             <div class="button-text">
    //                 Save
    //             </div>
    //         </div>
    //     </div>
    // `
    
}



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
    if (event.key !== "Enter" || event.shiftKey) {
        return;
    }

    event.preventDefault();
    
    const content = messageInput.textContent.trim();

    const res = await post_api(`/chat/message.php/message/${currentSelectedChannel.channelID}`, {
        content: content
    });

    if (res.success) {
        messageInput.textContent = "";

        let message = res.data;

        message.author = (await global.getCurrentSession()).employee;

        moveSelectedChannelToTop();

        await renderMessage(res.data);
        scrollMessagesToBottom();
        return;
    }

    global.popupAlert(
        "Unable to send message",
        `The following error occurred: ${res.error.message} (${res.error.code})`,
        "error"
    );

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