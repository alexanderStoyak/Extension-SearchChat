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


function deXSS(text) {
    return text.replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/['"`]/g, "&quot;");
}


function notifiers(text, title = 'ПоискЧата') {
    title = `
        <span style="
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    justify-content: flex-start;
        "> 
            ${icons({ name: 'notification_outline', size: 20, fill: 'secondary' })} ${title}
        </span>
    `

    Notifier.showEvent({ title, text });
}


function chunk(array, offset) {
    let task = [];
    while (array.length) {
        task.push(array.splice(0, offset));
    }

    return task;
}


async function getUsersOrGroupsFromVK(links, explicitIds) {
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
            id: chunk(links.filter(id => +id > 0), 1_000)
        });

        idsOrSreensNames.push({
            type: 'club',
            id: chunk(links.filter(id => +id < 0).map(id => Math.abs(id)), 1_000)
        });
    }


    const code = `
        var idsOrSreensNames = ${JSON.stringify(idsOrSreensNames)};
        var i = 0;
        var returns = [];

        while(i < idsOrSreensNames.length) {
            var info = idsOrSreensNames[i];

            if(info.type == "club") {
                var i = 0;
                var groups = API.groups.getById({ group_ids: info.id[i] });
                
                while(i < info.id.length) {
                    i = i + 1;
                    
                    if(info.id[i]) {
                        groups = groups + API.groups.getById({ group_ids: info.id[i] });
                    };
                };
                
                returns.push(groups);
            };

            if(info.type == "user") {
                var i = 0;
                var users = API.users.get({ user_id: info.id[i], fields: 'photo_100,online,last_seen'});
                
                while(i < info.id.length) {
                    i = i + 1;
                    
                    if(info.id[i]) {
                        users = users + API.users.get({ user_id: info.id[i], fields: 'photo_100,online,last_seen'});
                    };
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
async function userOrGropChats(link, offset = 0, isCurrent = false) {
    if (load.chats) return;
    else load.chats = true;


    const [object] = await getUsersOrGroupsFromVK([link]);

    const typeMention = object?.first_name ? 'id' : 'club';
    const objectName = deXSS(
        typeMention === 'id'
            ? `${object.first_name} ${object.last_name}`
            : `группа «${object.name}»`
    );

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
        getUsersOrGroupsFromVK(
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


        if (currentPage < totalPage) {
            if(offset > 0) {
                listChatsHTML += '<span style="font-weight: bold;">|</span>';
            }
                
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
            userOrGropChats(link, offset += 15);
        };
    }

    if (previousPageButton) {
        previousPageButton.onclick = () => {
            userOrGropChats(link, offset -= 15);
        };
    }

    const buttonMembers = document.getElementsByClassName('membersChat');

    buttonMembers.forEach((button, index) => button.onclick = () => showUsersChat(index, friends, userOrGropChats));

    let linksChats = document.getElementsByClassName('copyLinkForChat');

    for (const link of linksChats) {
        link.onclick = () => {
            copy(link.getAttribute('link'));
            notifiers(`Ссылка на чат скопирована`);
        }
    }

    load.chats = false;
}


async function searchChats(title, offset = 0, isCurrent = false) {
    if (load.chats) return;
    else load.chats = true;

    if(title.length > 150) {
        return notifiers(`Название чата не должно превышать 150 символов`);
    }


    newModalPage(`Чаты по запросу «<span style="color: #71aaeb; font-weight: bold;">${deXSS(title)}</span>»`)
        .content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"></span></div>`)
        .show();


    let foundChats;

    if (!isCurrent) {
        foundChats = await SCAPI.call({
            method: 'extension.getChats',
            parameters: {
                title,
                offset
            }
        });


        currentChats = {
            foundChats,
            offset,
            title
        };
    } else {
        foundChats = currentChats.foundChats;
    }


    if (!foundChats.found) {
        load.chats = false;
        modalPage.hide();
        return notifiers(`Извините, но не один чат, соответствующий Вашему запросу, не найден`);
    }

    const [creators, friends] = await Promise.all([
        getUsersOrGroupsFromVK(
            foundChats.chats.map(chat => chat.creator),
            true
        ),
        getFriends()
    ]);


    newModalPage(`
        Чаты по запросу «<span style="color: #71aaeb; font-weight: bold;">${title}</span>»
        <span style="color: #828282; font-weight: 500;"> 
            ${foundChats.found.toLocaleString('ru-RU')}шт. 
        </span>
    `);

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
            searchChats(title, offset += 15);
        };
    }

    if (previousPageButton) {
        previousPageButton.onclick = () => {
            searchChats(title, offset -= 15);
        };
    }

    const buttonMembers = document.getElementsByClassName('membersChat');

    buttonMembers.forEach((button, index) => button.onclick = () => showUsersChat(index, friends, searchChats));

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
    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
            <svg
                width="28" 
                height="28"
                class="vkuiIcon vkuiIcon--28 vkuiIcon--w-28 vkuiIcon--h-28"
                display="block"
                style="border-radius: 50%"
            >
                <image
                    width="28"
                    height="28"
                    xlink:href="https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/icons/logo.png" 
                />
            </svg>
            <span style="font-size: 20px; display: flex; font-weight: bold;"> 
                Авторизация 
            </span>
        </div>
    `);

    const Html = `
            <div class="ProfileModalInfoHeadline" style="padding: 10px;">
                <span style="display: block; gap: 5px; text-align: center; font-size: 13px;">
                    Расширение «ПоискЧата» представляет собой инструмент для поиска чатов во ВКонтакте. В настоящее время расширение находиться на стадии разработки, рекомендуем следить за всеми обновлениями в <a style="color: #71aaeb;" target="_blank" href="${services.telegramChannelURL}">нашем телеграм канале</a>. Некоторые функции, включая просмотр чатов пользователей, могут потребовать платной подписки в любой момент.

                    <hr style="margin-top: 30px"  class="separator" data-content="Получение Вашего токена"/>
                    <span style="color: ${appearance === 'dark' ? '#f6c254' : '#df9700'};">
                        Для использования расширения необходима авторизация, которая будет выполняться путем получения Вашего токена ВКонтакте с помощью приложения «<a style="color: #71aaeb;" target="_blank" href="${services.auth.urlByGetCode}">ПоискЧата</a>».
                    </span>
          
                    <hr style="margin-top: 25px;" class="separator" data-content="Важно"/>
                    <span> 
                        Ваш токен будет сохранен только на Вашем компьютере (локально) и будет действителен только в течение 24 часов. По истечении этого времени будет получен новый токен, чтобы гарантировать его актуальность во время использования расширения. Таким образом, фактическое хранение токена на сервере невозможно. 
                    </span>
                    
                    <hr style="margin-top: 25px" class="separator" data-content="Авторизация"/>
                    Пожалуйста, нажмите на кнопку: 
                    <a style="
                        display: inline-block; 
                        font-weight: 500; 
                        padding: 0 .5em; 
                        line-height: 1.5em; 
                        max-width: max-content; 
                        background-color: ${appearance === 'dark' ? '#4b4b4b' : '#ebf2fa'}; 
                        border-radius: 50px;
                        color: ${appearance === 'dark' ? '#828282' : '#3770b1'};
                        text-align: center; 
                        text-decoration: none"
                        id="buttonAuthForModalPage"
                    >
                        Подтвердить регистрацию
                    </a>
                    <br/>В ином случае функционал расширения не будет работать.
                </span>
            </div>
    `;

    modalPage.content(Html).show();


    const buttonAuthForModalPage = document.getElementById('buttonAuthForModalPage');
    buttonAuthForModalPage.onclick = async () => {
        notifiers('Регистрация учетной записи в расширении ПоискЧата..');
        const isValid = await vkAuth();

        if (isValid) {
            notifiers(`<span style="color: #A8E4A0; font-weight: bold;">Авторизованный, VK токен получен (ПоискЧата)\nДобро пожаловать в ПоискЧата!</span>`);
        } else return;

        modalPage.hide();
        notifiers('Через 5 секунд эта страничка будет перезагружена для начала работы расширения');
        setTimeout(() => location.reload(), 5_000);
    };

    GM_setValue('timeStampAuthModalPage', services.timeStampAuthModalPage = Infinity);
}


async function showUsersChat(indexChat, friends, backFunction) {
    const chat = currentChats.foundChats.chats[indexChat];

    const header = `
        <a id="backButton" style="text-decoration: none; color: #99a2ad; font-weight: bold; padding-right: 10px"> Назад </a> 
            Участники чата 
        <span style="font-weight: bold; color: #71aaeb;"> 
            ${deXSS(chat.title)}
        </span> 
        <span style="color: #99a2ad; font-weight: 500;"> 
            ${chat.membersCount.toLocaleString('ru-RU')} 
        </span>
    `;

    newModalPage(header)
        .content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`)
        .show();

    const membersList = await getUsersOrGroupsFromVK(chat.members, true);

    const friendsIds = friends.map(friend => friend.id);
    const creator = membersList.find(member => member.id === Math.abs(chat.creator));

    membersList.splice(membersList.findIndex(member => member.id === Math.abs(chat.creator)), 1);

    const sortedMembersList = membersList.filter(member => friendsIds.includes(member.id))
        .concat(
            membersList.filter(member => !member.first_name),
            membersList.filter(member => !friendsIds.includes(member.id) && member.first_name)
                .sort((a, b) => b.online - a.online)
        );

    let html = '<div class="ChatSettings__pane"> <div class="ChatSettingsMembersWidget__list">';

    if (creator) {
        html += blankMembersList({ member: creator, creator: creator.id, friends });
    }

    for (const member of sortedMembersList) {
        html += blankMembersList({ member, creator: 0, friends });
    }

    html += '</div> </div>';

    newModalPage(header)
        .content(html)
        .show();

    const backButton = document.getElementById('backButton');

    backButton.onclick = () => {
        backFunction(currentChats.link ?? currentChats.title, currentChats.offset, true);
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
            ${index === 0
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

    return await VKAPI.call('execute', { code });
}


// https://angel-rs.github.io/css-color-filter-generator/
const iconColors = {
    accent: 'brightness(0) saturate(100%) invert(66%) sepia(13%) saturate(1970%) hue-rotate(180deg) brightness(98%) contrast(88%);',
    textAccentThemed: 'brightness(0) saturate(100%) invert(43%) sepia(35%) saturate(1094%) hue-rotate(172deg) brightness(83%) contrast(81%);',
    secondary: 'brightness(0) saturate(100%) invert(55%) sepia(0%) saturate(1%) hue-rotate(295deg) brightness(94%) contrast(96%);',
    white: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(203deg) brightness(112%) contrast(109%);'
}
function icons({ name, realSize = 24, size = realSize, fill = 'accent' }) {

    return `
        <svg 
            fill="currentColor" 
            stroke="currentColor"
            width="${size}" 
            height="${size}"
            style="filter: ${iconColors[fill]}"
            class="vkuiIcon vkuiIcon--${size} vkuiIcon--w-${size} vkuiIcon--h-${size}"
            display="block"
        >
            <image
                width="${size}"
                height="${size}"
                xlink:href="https://raw.githubusercontent.com/VKCOM/icons/master/packages/icons/src/svg/${realSize}/${name}_${realSize}.svg" 
            />
        </svg>
    `;
}