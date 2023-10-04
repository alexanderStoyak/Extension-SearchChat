async function buttonInMessages(peerHistory) {

    const messages = peerHistory.getElementsByClassName('im-mess-stack _im_mess_stack');

    for (const message of messages) {
        const actions = message.getElementsByClassName('im-mess--actions');

        for (const action of actions) {

            if (!action.innerHTML.includes('id="buttonInMessages"')) {
                const newAction = document.createElement('span');

                newAction.id = 'buttonInMessages';
                newAction.className = 'im-mess--fav'
                newAction.role = 'link';
                newAction.title = 'Просмотр чатов';
                newAction.innerHTML = icons({name: 'chats', fill: 'secondary', size: 16});

                const [{ href }] = message.getElementsByClassName('im-mess-stack--lnk');
                newAction.onclick = () => userOrGropChats(href, 0);

                action.prepend(newAction);
            }
        }
    }
}