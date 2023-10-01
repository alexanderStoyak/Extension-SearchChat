async function buttonInMessages(peerHistory) {

    const messages = peerHistory.getElementsByClassName('im-mess-stack--pname');

    const bodyButton = `<a style="color: #71aaeb; font-weight: bold;"> Чаты </a>`;


    for (const message of messages) {
        if (!message.innerHTML.includes(bodyButton)) {
            const button = document.createElement('a');

            const [{ href }] = message.getElementsByClassName('im-mess-stack--lnk');

            button.onclick = () => userOrGropChats(href, 0);

            button.innerHTML = bodyButton;

            message.appendChild(button);
        }
    }
}