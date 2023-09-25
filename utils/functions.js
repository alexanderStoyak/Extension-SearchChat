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


    const [object] = await getUsersOrGroups([link]);

    const typeMention = object?.last_name ? 'id' : 'club';
    const objectName = typeMention === 'id'
        ? `${object.first_name} ${object.last_name}`
        : `группа «${object.name}»`;

    newModalPage(`Чаты, в которых находится <a style="font-weight: bold;" href="${link}">${objectName}</a>`);
    modalPage.content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`);
    modalPage.show();

    const foundChats = await SCAPI.call({
        parameters: {
            userId: typeMention === 'id' ? object.id : -object.id,
            offset
        }
    });

    if (!foundChats.found) {
        isLoad = false;
        modalPage.hide();
        return notifiers(`Не смог найти чаты в которых мог(ла) бы быть <a style="font-weight: bold;" href="${link}">${objectName}</a>`);
    }

    const creators = await getUsersOrGroups(
        foundChats.chats.map(chat => chat.creator)
    );

    if (modalPage && modalPage.isVisible()) {
        modalPage.hide();
    };


    newModalPage(`Чаты, в которых находится <a style="font-weight: bold;" href="${link}">${objectName}</a> (${foundChats.found.toLocaleString('ru-RU')}шт.)`);


    let listChatsHTML = foundChats.chats.map((chat, index) => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, creator: creators[index] });
    }).join('');

    const curentPage = offset / 15 !== 0 ? offset / 15 + 1 : 1;
    const totalPage = Math.ceil(foundChats.found / 15 || 1);

    listChatsHTML += `<div style="display: flex; justify-content: flex-end; gap: 5px">`;
    listChatsHTML += `<span style="padding-right: 10px"> Страница ${curentPage}/${totalPage} </span>`;

    if (foundChats.found > 15) {
        if (offset > 0) {
            listChatsHTML += `
                <a id="previousPageButton" 
                    style="text-decoration: none; font-weight: bold;"> 
                    < Назад
                </a>
            `;
        };

        if (curentPage < totalPage && offset > 0) {
            listChatsHTML += '|';
        }

        if (curentPage < totalPage) {
            listChatsHTML += `
                <a id="nextPageButton" 
                    style="padding-right: 10px; text-decoration: none; font-weight: bold;"> 
                    Далее >
                </a>
            `;
        }
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



async function authModalPage() {
    newModalPage(`<span style="font-size: 20px; display: flex; join-content: center; font-weight: bold;"> Добро пожаловать в ПоискЧата!</span>`);

    const Html = `
            <div class="ProfileModalInfoHeadline" style="padding: 10px;">
                <span style="font-size: 13px; display: inline; gap: 5px; font-weight: 600; jostify-content: center; align-items: center;">
                    Расширение «ПоискЧата» представляет собой инструмент для поиска чатов во ВКонтакте. В настоящее время доступен только просмотр чатов пользователей ВКонтакте или групп. Возможность поиска чатов по названию будет добавлена позже, когда разработка расширения будет завершена. Некоторые функции, включая просмотр чатов пользователей, могут потребовать платной подписки в любой момент.
                    <br/><br/>

                    <span style="color: #FD324A;"> 
                        Для использования расширения необходима авторизация, которая будет выполняться путем получения вашего токена ВКонтакте с помощью приложения <a target="_blank" href="${services.urlByGetToken}">Kate Mobile</a>.
                    </span>

                    <br/><br/> 
                    Пожалуйста, нажмите на кнопку: <a id="buttonAuthForModalPage"> подтвердить регистрацию.</a> В противном случае функционал расширения не будет работать.
                    
                    <br/><br/>
                    Ваш токен будет сохранен только на вашем компьютере (локально)
                </span>
            </div>
    `;

    modalPage.content(Html);
    modalPage.show();

    const buttonAuthForModalPage = document.getElementById('buttonAuthForModalPage');
    buttonAuthForModalPage.onclick = async () => {
        await vkAuth();
        modalPage.hide();
        notifiers('Через 5 секунд эта страничка будет перезагружена для начала работы расширения');
        setTimeout(() => location.reload(), 5_000);
    };

    GM_setValue('timeStampAuthModalPage', services.timeStampAuthModalPage = Infinity);
};