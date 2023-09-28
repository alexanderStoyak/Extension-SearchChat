let modalPage = 0;
function newModalPage(title) {
    if (modalPage && modalPage.isVisible()) {
        modalPage.hide();
    }

    if (!modalPage || !modalPage.isVisible()) {
        modalPage = new MessageBox({
            title,
            width: 500,
            hideButtons: true,
            bodyStyle: 'padding: 5px;'
        });
    }

    return modalPage;
}


function notifiers(text, title = 'ПоискЧата') {
    Notifier.showEvent({ title, text });
}


function chunk(array, offSet) {
    let task = [];
    while (array.length) {
        task.push(array.splice(0, offSet));
    }

    return task;
}


async function getUsersOrGroups(links, explicitIds) {
    let idsOrSreensNames = [];

    if (!explicitIds) {
        idsOrSreensNames = links.map(link => {
            let idOrScreenName = link.toString().replace(/http(s)?:\/\/vk.(com|ru)\//g, '');

            const regExp = /^(id|club)([0-9]+)/;
            const isDefaultLink = regExp.test(idOrScreenName);
            const match = idOrScreenName.match(regExp);
            const isId = !isNaN(+idOrScreenName);

            if (isDefaultLink) {
                idOrScreenName = idOrScreenName.replace(/id|club/, '');
            }

            if (isDefaultLink || isId) {
                idOrScreenName = {
                    type: isId
                        ? idOrScreenName > 0 ? 'user' : 'club'
                        : match[1] === 'id' ? 'user' : 'club',
                    id: [Math.abs(idOrScreenName)]
                };
            } else {
                idOrScreenName = {
                    type: 'undefined',
                    id: [idOrScreenName]
                };
            }

            return idOrScreenName;
        });
    } else {
        idsOrSreensNames.push({
            type: 'user',
            id: chunk(links.filter(id => +id > 0), 5_000)
        });

        idsOrSreensNames.push({
            type: 'club',
            id: chunk(links.filter(id => +id < 0).map(id => Math.abs(id)), 5_000)
        });
    }


    const code = `
        var idsOrSreensNames = ${JSON.stringify(idsOrSreensNames)};
        var i = 0;
        var returns = [];

        while(i < idsOrSreensNames.length) {
            var info = idsOrSreensNames[i];

            if(info.type == "club") {
                var groups = API.groups.getById({ group_ids: info.id[0] });
                if(info.id[1]) {
                    groups = groups + API.groups.getById({ group_ids: info.id[1] });
                };
                
                returns.push(groups);
            };

            if(info.type == "user") {
                var users = API.users.get({ user_id: info.id[0], fields: 'photo_100,online,last_seen' });
                if(info.id[1]) {
                    users = users + API.users.get({ user_id: info.id[1], fields: 'photo_100,online,last_seen'});
                };
                
                returns.push(users);
            };

            if(info.type == "undefined") {
                var object = API.groups.getById({ group_id: info.id[0] });
                if(!object) {
                    object = API.users.get({ user_id: info.id[0], fields: 'photo_100,online,last_seen' });
                };

                returns.push(object);
            };

            i = i + 1;
        };
        return returns;
    `;

    const response = await VKAPI.call('execute', { code });


    return [].concat.apply([], response);
}


function decOfNum(number, words) {
    return words[
        number % 100 > 4 && number % 100 < 20
            ? 2
            : [2, 0, 1, 1, 1, 2][number % 10 < 5
                ? Math.abs(number) % 10
                : 5
            ]
    ];
}


const load = {
    chats: false
};
let currentChats = {};
async function onClickButtonForChats(link, offset, isCurrent = false) {
    if (load.chats) return;
    else load.chats = true;


    const [object] = await getUsersOrGroups([link]);

    const typeMention = object?.first_name ? 'id' : 'club';
    const objectName = typeMention === 'id'
        ? `${object.first_name} ${object.last_name}`
        : `группа «${object.name}»`;

    newModalPage(`Чаты, в которых находится <a style="color: #71aaeb; font-weight: bold;" href="${link}">${objectName}</a>`)
        .content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`)
        .show();


    let foundChats;

    if (!isCurrent) {
        foundChats = await SCAPI.call({
            parameters: {
                userId: typeMention === 'id' ? object.id : -object.id,
                offset
            }
        });

        currentChats = {
            foundChats,
            offset,
            link
        };
    } else {
        foundChats = currentChats.foundChats;
    }

    if (!foundChats.found) {
        load.chats = false;
        modalPage.hide();
        return notifiers(`Не смог найти чаты в которых мог(ла) бы быть <a style="font-weight: bold;" href="${link}">${objectName}</a>`);
    }

    const [creators, friends] = await Promise.all([
        getUsersOrGroups(
            foundChats.chats.map(chat => chat.creator),
            true
        ),
        getFriends()
    ]);


    newModalPage(`Чаты, в которых находится <a style="color: #71aaeb; font-weight: bold;" href="${link}">${objectName}</a> <span style="color: #828282; font-weight: 500;"> ${foundChats.found.toLocaleString('ru-RU')}шт. </span>`);


    let listChatsHTML = foundChats.chats.map(chat => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, friends, creator: creators.find(creator => creator.id === Math.abs(chat.creator)) });
    }).join('');


    const currentPage = offset / 15 !== 0 ? offset / 15 + 1 : 1;
    const totalPage = Math.ceil(foundChats.found / 15 || 1);


    listChatsHTML += `<div style="display: flex; justify-content: flex-end; gap: 5px">`;
    listChatsHTML += `<span style="padding-right: 10px; color: #99a2ad; font-weight: 500;"> Страница ${currentPage}/${totalPage} </span>`;


    if (foundChats.found > 15) {
        if (offset > 0) {
            listChatsHTML += `
                <a id="previousPageButton" 
                    style="${!(currentPage < totalPage) ? 'padding-right: 15px;' : ''} text-decoration: none; font-weight: bold; color: #71aaeb;"> 
                    < Назад
                </a>
            `;
        }

        if (currentPage < totalPage && offset > 0) {
            listChatsHTML += '<span style="font-weight: bold;">|</span>';
        }

        if (currentPage < totalPage) {
            listChatsHTML += `
                <a id="nextPageButton" 
                    style="padding-right: 15px; text-decoration: none; font-weight: bold; color: #71aaeb;"> 
                    Далее >
                </a>
            `;
        }
    }


    listChatsHTML += `</div>`;

    modalPage.content(listChatsHTML).show();

    const nextPageButton = document.getElementById('nextPageButton');
    const previousPageButton = document.getElementById('previousPageButton');

    if (nextPageButton) {
        nextPageButton.onclick = () => {
            onClickButtonForChats(link, offset += 15);
        };
    }

    if (previousPageButton) {
        previousPageButton.onclick = () => {
            onClickButtonForChats(link, offset -= 15);
        };
    }

    const buttonMembers = document.getElementsByClassName('membersChat');

    buttonMembers.forEach((button, index) => button.onclick = () => showUsersChat(index, friends));

    let linksChats = document.getElementsByClassName('copyLinkForChat');

    for (const link of linksChats) {
        link.onclick = () => {
            copy(link.getAttribute('link'));
            notifiers(`Ссылка на чат скопирована`);
        }
    }

    load.chats = false;
}


async function authModalPage() {
    newModalPage(`<span style="font-size: 20px; display: flex; font-weight: bold;"> Добро пожаловать в ПоискЧата!</span>`);

    const Html = `
            <div class="ProfileModalInfoHeadline" style="padding: 10px;">
                <span style="font-size: 13px; display: inline; gap: 5px; font-weight: 600; align-items: center;">
                    Расширение «ПоискЧата» представляет собой инструмент для поиска чатов во ВКонтакте. В настоящее время доступен только просмотр чатов пользователей ВКонтакте или групп. Возможность поиска чатов по названию будет добавлена позже, когда разработка расширения будет завершена. Некоторые функции, включая просмотр чатов пользователей, могут потребовать платной подписки в любой момент.
                    <br/><br/>

                    <span style="color: #FD324A;"> 
                        Для использования расширения необходима авторизация, которая будет выполняться путем получения вашего токена ВКонтакте с помощью приложения «<a class="link" target="_blank" href="${services.auth.urlByGetCode}">ПоискЧата</a>».
                    </span>

                    <br/><br/> 
                    Пожалуйста, нажмите на кнопку: <a class="link" id="buttonAuthForModalPage"> подтвердить регистрацию.</a> В противном случае функционал расширения не будет работать.
                    
                    <br/><br/>
                    Ваш токен будет сохранен только на вашем компьютере (локально) и будет действителен только в течение 24 часов. По истечении этого времени будет получен новый токен, чтобы гарантировать его актуальность во время использования расширения. Таким образом, фактическое хранение токена на сервере невозможно.
                </span>
            </div>
    `;

    modalPage.content(Html).show();


    const buttonAuthForModalPage = document.getElementById('buttonAuthForModalPage');
    buttonAuthForModalPage.onclick = async () => {
        notifiers('Регистрация учетной записи в расширении ПоискЧата..');
        const isValid = await vkAuth();

        if(isValid) {
            notifiers(`<span style="color: #A8E4A0; font-weight: bold;">Авторизованный, VK токен получен (ПоискЧата)\nДобро пожаловать в ПоискЧата!</span>`);
        } else return;

        modalPage.hide();
        notifiers('Через 5 секунд эта страничка будет перезагружена для начала работы расширения');
        setTimeout(() => location.reload(), 5_000);
    };

    GM_setValue('timeStampAuthModalPage', services.timeStampAuthModalPage = Infinity);
}


async function showUsersChat(indexChat, friends) {
    const chat = currentChats.foundChats.chats[indexChat];

    const header = `
        <a id="backButton" style="text-decoration: none; color: #99a2ad; font-weight: bold; padding-right: 10px"> Назад </a> 
            Участники чата 
        <span style="font-weight: bold; color: #71aaeb;"> 
            ${chat.title}
        </span> 
        <span style="color: #99a2ad; font-weight: 500;"> 
            ${chat.membersCount.toLocaleString('ru-RU')} 
        </span>
    `;

    newModalPage(header)
        .content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`)
        .show();

    const membersList = await getUsersOrGroups(chat.members, true);

    let html = '<div class="ChatSettings__pane"> <div class="ChatSettingsMembersWidget__list">';

    for (const member of membersList.reverse()) {
        html += blankMembersList({ member, creator: chat.creator, friends });
    }

    html += '</div> </div>';

    newModalPage(header)
        .content(html)
        .show();

    const backButton = document.getElementById('backButton');

    backButton.onclick = () => {
        onClickButtonForChats(currentChats.link, currentChats.offset, true);
    };
}


function copy(text) {
    const input = document.createElement('input');
    const yPosition = window.pageYOffset || document.documentElement.scrollTop;

    input.style.position = 'absolute';
    input.style.left = '-9999px';

    input.style.top = `${yPosition}px`;

    document.body.appendChild(input);
    input.value = text;

    input.focus();

    input.select();

    document.execCommand('copy');

    document.body.removeChild(input);
}


function usersStack(arrayLinks) {
    return arrayLinks.map((link, index) => {
        return `<svg xmlns="http://www.w3.org/2000/svg" className="UsersStack-module__photo--iCBco" aria-hidden="true" style="width: 24px; height: 24px">
        <defs>
            ${
                index === 0 
                    ? `<circle cx="12" cy="12" r="12" id=":r0:${index}"/>` 
                    : `<path d="M2,18.625A12 12 0 0 0 12 24A12 12 0 0 0 12 0A12 12 0 0 0 2 5.375A12 12 0 0 1 2,18.625" id=":r0:${index}"/>`
            }
        </defs>
        <clipPath id="UsersStackMask:r0:${index}">
            <use href="#:r0:${index}"/>
        </clipPath>
        <g clip-path="url(#UsersStackMask:r0:${index})">
            <use href="#:r0:${index}" className="SVGStackMask-module__fill--pL05i"/>
            <image href="${link}" width="24" height="24"/>
            <use href="#:r0:${index}" fill="none" className="SVGStackMask-module__useElement--usICi"/>
        </g>
    </svg>`

    }).join('');
}


async function getFriends() {
    const code = `
        var firstChunk = API.friends.get({fields: 'photo_100'}).items;
        var secondChunk = API.friends.get({fields: 'photo_100', offset: 5000}).items;
        
        return firstChunk + secondChunk;
    `;

    return await VKAPI.call('execute', {code});
}