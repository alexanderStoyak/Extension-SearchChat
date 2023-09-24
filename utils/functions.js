let modalPage = 0;
function newModalPage(title) {
    if (!modalPage || !modalPage.isVisible()) {
        modalPage = new MessageBox({
            title,
            width: 500,
            hideButtons: true,
            bodyStyle: 'padding: 5px;'
        });
    }

    return modalPage;
};


function notifiers(text, title = 'ПоискЧата') {
    Notifier.showEvent({ title, text });
};


async function getUsersOrGroups(links) {
    const sreensNames = links.map(link => {
        let idOrSreenName = `${link.toString().replace(/vk\.ru\/|vk\.com\/|https:\/\/|http:\/\//g, '')}`;

        if (idOrSreenName < 0) {
            idOrSreenName = {
                type: 'club',
                id: -idOrSreenName
            };
        } else if (idOrSreenName > 0) {
            idOrSreenName = {
                type: 'user',
                id: idOrSreenName
            };
        } else {
            idOrSreenName = {
                type: 'undefined',
                id: idOrSreenName
            };
        };

        return idOrSreenName;
    });

    const code = `
        var sreensNames = ${JSON.stringify(sreensNames)};
        var i = 0;
        var returns = [];

        while(i < sreensNames.length) {
            var info = sreensNames[i];

            if(info.type == "club") {
                returns.push(API.groups.getById({ group_id: info.id })[0]);
            };

            if(info.type == "user") {
                returns.push(API.users.get({ user_id: info.id })[0]);
            };

            if(info.type == "undefined") {
                var obj = API.groups.getById({ group_id: info.id })[0];
                if(obj == null) {
                    obj = API.users.get({ user_id: info.id })[0];
                };

                returns.push(obj);
            };

            i = i + 1;
        };
        return returns;
    `;

    const response = await VKAPI.call('execute', { code });

    return response;
}


function decOfNum(number, words) {
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
}


let isLoad = false;
const onClickButtonForChats = async (link, offset) => {
    if (isLoad) {
        return;
    } else {
        isLoad = true;
    };

    const [user] = await getUsersOrGroups([link]);

    const foundChats = await SCAPI.call({
        parameters: { userId: user.id, offset }
    });

    if (!foundChats.found) {
        return notifiers(`Не смог найти чаты в которых мог бы быть <a style="font-weight: bold;" href="${link}"> ${user.first_name} ${user.last_name} </a>`);
    }

    const creators = await getUsersOrGroups(
        foundChats.chats.map(chat => chat.creator)
    );

    if (modalPage && modalPage.isVisible()) {
        modalPage.hide();
    };

    newModalPage(`Чаты, в которых находится <a style="font-weight: bold;" href="${link}"> ${user.first_name} ${user.last_name} </a> (${foundChats.found.toLocaleString('ru-RU')}шт.)`);

    let listChatsHTML = foundChats.chats.map((chat, index) => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, creator: creators[index] });
    }).join('');

    listChatsHTML += `<div style="display: flex; justify-content: flex-end; gap: 5px">`;
    listChatsHTML += `<span style="padding-right: 25px"> Страница ${offset / 15 !== 0 ? offset / 15 + 1 : 1}/${Math.ceil(foundChats.found / 15 || 1)} </span>`;
    
    if (foundChats.found > 15) {
        if (offset > 0) {
            listChatsHTML += `
                <a id="previousPageButton" 
                    style="text-decoration: none; font-weight: bold;"> 
                    Назад
                </a>
                •
            `;
        };

        listChatsHTML += `
            <a id="nextPageButton" 
                style="padding-right: 10px; text-decoration: none; font-weight: bold;"> 
                Далее
            </a>
        `;
    };
    listChatsHTML += `</div>`;

    modalPage.content(listChatsHTML);

    modalPage.show();

    const nextPageButton = document.getElementById('nextPageButton');
    const previousPageButton = document.getElementById('previousPageButton');
    if (nextPageButton) {
        nextPageButton.onclick = () => {
            onClickButtonForChats(link, offset += 15);
        };
    };
    if (previousPageButton) {
        previousPageButton.onclick = () => {
            onClickButtonForChats(link, offset -= 15);
        };
    };

    isLoad = false;
};