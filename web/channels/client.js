
const CHANNEL_TYPE_DM = 0;
const CHANNEL_TYPE_GROUP = 1;
import * as global from "../global-ui.js"


const channelList = document.getElementById('channel-list-wrapper');

const channelDetails = document.getElementById('channel-details');
const channelName = channelDetails.querySelector('.channel-name');
const channelMembers = channelDetails.querySelector('.channel-members');
const channelIcon = channelDetails.querySelector('#channel-icon-wrapper');

const noSelectedChannel = document.getElementById('no-selected-channel');

const channelMap = new Map();



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

    element.appendChild(icon);
    element.appendChild(details);

    return element;
}

async function fetchAndRenderChannels() {

    const res = await get_api("/chat/channel.php/list");

    if (!res.success) {
        return;
    }

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

