async function buttonInMessages(buttonsElement) {

    const messages = buttonsElement.getElementsByClassName('im-mess-stack--pname');


    for (const message of messages) {
        if (!message.innerHTML.includes('Чаты')) {
            const button = document.createElement('a');

            const href = message.getElementsByClassName('im-mess-stack--lnk')[0].href;

            button.onclick = () => onClickButtonForChats(href, 0);

            button.innerHTML = '<span style="font-weight: 500;"> Чаты </span>';

            message.appendChild(button);
        };
    };
};