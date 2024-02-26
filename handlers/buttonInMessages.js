function createActions({ id, title, innerHTML }) {
    const action = document.createElement('span');

    action.id = id;
    action.className = 'im-mess--fav'
    action.role = 'link';
    action.setAttribute('onmouseover', `showTitle(this, '${title}')`);
    action.innerHTML = innerHTML;

    return action;
}

async function buttonInMessages(peerHistory) {
    const messages = peerHistory.getElementsByClassName('im-mess-stack _im_mess_stack');

    for (const message of messages) {
        const actions = message.getElementsByClassName('im-mess--actions');

        for (const action of actions) {

            if (!action.innerHTML.includes('id="action-for-search-chats"')) {

                const [{ href }] = message.getElementsByClassName('im-mess-stack--lnk');
                const newActioForChats = createActions({
                    id: 'action-for-search-chats',
                    title: 'Просмотр чатов',
                    innerHTML: icons({ name: 'chats', fill: 'secondary', size: 16 })
                });
                newActioForChats.onclick = () => searchChats(filters.link = href);


                const newActionForProfile = createActions({
                    id: 'action-for-search-chats',
                    title: 'Профиль в «ПоискЧата»',
                    innerHTML: icons({ name: 'user_square', fill: 'secondary', size: 16 })
                });
                newActionForProfile.onclick = () => showProfile({ id: href });


                action.append(newActioForChats);
                action.append(newActionForProfile);

            }
        }
    }
}