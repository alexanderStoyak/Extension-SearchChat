let modalPage = 0;
function newModalPage(title) {
    if (modalPage && modalPage.isVisible()) {
        modalPage.hide();
    }
    

    if (!modalPage || !modalPage.isVisible()) {
        modalPage = new MessageBox({
            title,
            width: 550,
            hideButtons: true,
            bodyStyle: 'padding: 5px;'
        });
    }

    if (modalPage) {
        const boxBody = [...document.getElementsByClassName('box_body')].at(-1);
        const boxTitle = [...document.getElementsByClassName('box_title')].at(-1);

        if (boxTitle) {
            boxTitle.style.height = 'auto';
            boxTitle.style.lineHeight = '20px';
            boxTitle.style.padding = '5px';
            boxTitle.style.overflow = 'visible';
        }

        const fixedTitle = () => {
            const modalPageTitle = [...document.getElementsByClassName('box_title_wrap')].at(-1);
            const boxLayout = [...document.getElementsByClassName('box_layout')].at(-1);
            const boxLayer = document.getElementById('box_layer');
            const modalPageScroll = document.getElementById('box_layer_wrap');

            modalPageScroll.onscroll = () => {
                const offset = modalPageTitle.offsetHeight + boxLayer.offsetHeight - boxLayout.offsetHeight - 80;
                if (modalPageTitle.getBoundingClientRect().top < 0 && !modalPageTitle.classList.contains('ui_tabs_fixed')) {
                    modalPageTitle.style.width = '550px';
                    modalPageTitle.style.borderRadius = '0px';
                    boxBody.style.marginTop = `${offset}px`;
                    modalPageTitle.classList.add('ui_tabs_fixed');
                } else if (boxBody.getBoundingClientRect().top >= modalPageTitle.offsetHeight) {
                    boxBody.style.marginTop = '0px';
                    modalPageTitle.style.borderRadius = '10px 10px 0px 0px';
                    modalPageTitle.classList.remove('ui_tabs_fixed');
                }
            }
        }

        modalPage.visible = () => {
            modalPage.show();
            fixedTitle();
        }

        modalPage.setContent = html => {
            if(modalPage.isVisible()) {
                boxBody.innerHTML = html;
                fixedTitle();
            }
        }

        modalPage.setTitle = html => {
            if(modalPage.isVisible()) {
                boxTitle.innerHTML = html;
                fixedTitle();
            }
        }
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
            ${icons({ name: 'notification_outline', size: 20, fill: 'secondary' })} 
            ${title}
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

        const users = links.filter(id => +id > 0);
        if (users.length) {
            idsOrSreensNames.push({
                type: 'user',
                id: chunk(users, 1_000)
            });
        }

        const groups = links.filter(id => +id < 0).map(id => Math.abs(id));
        if (groups.length) {
            idsOrSreensNames.push({
                type: 'club',
                id: chunk(groups, 1_000)
            });
        }
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
                var users = API.users.get({ user_id: info.id[i], fields: 'photo_100,online,last_seen,sex'});
                
                while(i < info.id.length) {
                    i = i + 1;
                    
                    if(info.id[i]) {
                        users = users + API.users.get({ user_id: info.id[i], fields: 'photo_100,online,last_seen,sex'});
                    };
                };
                
                returns.push(users);
            };

            if(info.type == "undefined") {
                var object = API.groups.getById({ group_id: info.id[0] });
                if(!object) {
                    object = API.users.get({ user_id: info.id[0], fields: 'photo_100,online,last_seen,sex' });
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
async function searchChats({ isCurrent = false, offset = 0 }) {

    if (load.chats) return;
    else load.chats = true;

    let parameters = {
        title: filters.title,
        onlyWithFriends: filters.onlyWithFriends,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        offset,
    }

    let user;
    if (filters.link) {
        user = (await getUsersOrGroupsFromVK([filters.link]))[0];
        if (user) {
            parameters.userId = user.first_name ? user.id : -user.id;
        }
    }

    const title = foundChats => `
        <div style="display: flex; justify-content: space-between; flex-direction: row;">
            <span style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;"> 
                <svg width="28" height="28" class="vkuiIcon vkuiIcon--28 vkuiIcon--w-28 vkuiIcon--h-28" display="block" style="border-radius: 50%">
                    <image width="28" height="28" xlink:href="https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/icons/logo.png"/>
                </svg>
                <span style="font-size: 20px; display: flex; font-weight: bold; gap: 5px ;flex-direction: row;"> 
                    ПоискЧата
                    <span style="font-weight: 400; color: #828282;"> > Чаты </span>
                </span>
            </span>
            ${foundChats ? 
                `
                <span style="color: #828282; font-weight: 400; display: flex; align-items: center; line-height: 49px;"> 
                    ${foundChats.toLocaleString('ru-RU')}шт. 
                </span>
                ` : ''
            }
        </div>
    `

    newModalPage(`
        <div>
            ${title()}
            ${blankSitingsSearchChats({ user })}
        </div>
    `)
        .content(`<div class="spinner" style="padding: 100px;"> <span class="spinner__animation"></span></div>`)
        .visible();

    let foundChats;

    if (!isCurrent) {
        foundChats = await SCAPI.call({
            parameters
        });

        currentChats = {
            foundChats,
            user,
            offset
        };
    } else {
        user = currentChats.user;
        foundChats = currentChats.foundChats;
        parameters.offset = currentChats.offset;
    }


    if (!foundChats.found) {
        load.chats = false;
        modalPage.setContent(
            blankNotFound(
                icons({ name: 'ghost_simple_outline', realSize: 36, size: 86, }),
                'По фильтрам ничего не найдено'
            )
        );
        modalPage.setTitle(`
            <div>
                ${title(foundChats.found)}
                ${blankSitingsSearchChats({ offset, user, foundChats: foundChats.found })}
            </div>
        `);

        onClicks('searchChats', {offset});
        return;
    }

    const [creators, friends] = await Promise.all([
        getUsersOrGroupsFromVK(
            foundChats.chats.map(chat => chat.creator),
            true
        ),
        getFriends()
    ]);


    modalPage.setTitle(`
        <div>
            ${title(foundChats.found)}
            ${blankSitingsSearchChats({ offset, user, foundChats: foundChats.found })}
        </div>
    `);

    const listChatsHTML = foundChats.chats.map(chat => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, friends, creator: creators.find(creator => creator.id === Math.abs(chat.creator)) });
    }).join('<br style="display: block; margin: 5px; content: \'\';">');

    modalPage.setContent(listChatsHTML);

    onClicks('searchChats', {offset, friends});

    load.chats = false;
}


async function authModalPage() {
    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
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

    modalPage.content(Html).visible();


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


async function showUsersChat(indexChat, friends, backFunction, offset = 0) {
    const chat = currentChats.foundChats.chats[indexChat];

    const header = `
        <div style="display: flex; flex-direction: column;">
            <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
                <a id="back_button_modal_page"> 
                    ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })} Назад 
                </a> 
                    Участники чата 
                <span style="max-width: 100px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: bold; color: #71aaeb;"> 
                    ${deXSS(chat.title)}
                </span> 
                <span style="color: #99a2ad; font-weight: 500;"> 
                    ${chat.membersCount.toLocaleString('ru-RU')} 
                </span>
           </div>
       </div>
    `;

    newModalPage(header)
        .content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`)
        .visible();

    const membersList = await getUsersOrGroupsFromVK(chat.members, true);

    const friendsIds = friends.map(friend => friend.id);
    const creator = membersList.find(member => member.id === Math.abs(chat.creator));

    membersList.splice(membersList.findIndex(member => member.id === Math.abs(chat.creator)), 1);

    const sortedMembersList = membersList.filter(member => friendsIds.includes(member.id))
        .concat(
            membersList.filter(member => !member.first_name),
            membersList.filter(member => !friendsIds.includes(member.id) && member.first_name)
                .sort((a, b) => b.online - a.online)
        )
        .splice(offset, 500);

    let html = `
        <div class="ChatSettings__pane"> 
            <div class="ChatSettingsMembersWidget__list" id="chat_users"></div> 
        </div>
    `;

    const currentPage = offset / 500 !== 0 ? offset / 500 + 1 : 1;
    const totalPage = Math.ceil(chat.membersCount / 500 || 1);

    modalPage.setContent(html);

    const usersChatBody = document.getElementById('chat_users');

    usersChatBody.innerHTML += `<div style="display: flex; justify-content: flex-end; gap: 5px">`;
    usersChatBody.innerHTML += `<span style="padding-right: 10px; color: #99a2ad; font-weight: 500;"> Страница ${currentPage}/${totalPage} </span>`;


    if (chat.membersCount > 500) {
        if (offset > 0) {
            usersChatBody.innerHTML += `
                <a id="previous_page_button" 
                    style="${!(currentPage < totalPage) ? 'padding-right: 15px;' : ''} text-decoration: none; font-weight: bold; color: #71aaeb;"> 
                    < Назад
                </a>
            `;
        }

        if (currentPage < totalPage && offset > 0) {
            usersChatBody.innerHTML += '<span style="font-weight: bold;">|</span>';
        }

        if (currentPage < totalPage) {
            usersChatBody.innerHTML += `
                <a id="next_page_button" 
                    style="padding-right: 15px; text-decoration: none; font-weight: bold; color: #71aaeb;"> 
                    Далее >
                </a>
            `;
        }
    }

    usersChatBody.innerHTML += `</div>`;

    if (creator && offset === 0) {
        usersChatBody.innerHTML += blankMembersList({ member: creator, creator: creator.id, friends });
    }

    let htmlUsers = '';

    for (const member of sortedMembersList) {
        htmlUsers += blankMembersList({ member, creator: 0, friends });
    }

    usersChatBody.innerHTML += htmlUsers;

    onClicks('showUsersChat', {indexChat, friends, backFunction, offset});
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
    white: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(203deg) brightness(112%) contrast(109%);',
    iconsAccent: appearance === 'dark'
        ? 'brightness(0) saturate(100%) invert(59%) sepia(9%) saturate(3344%) hue-rotate(175deg) brightness(75%) contrast(92%);'
        : 'brightness(0) saturate(100%) invert(78%) sepia(22%) saturate(6954%) hue-rotate(184deg) brightness(100%) contrast(84%);'
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


async function showStatistics() {
    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            ${icons({ name: 'favorite_outline', fill: 'accent', realSize: 20, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Статистика хранилища и топ
            </span>
        </div>
    `).content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`).visible();


    const stats = await SCAPI.call({ method: 'extension.getStats' });

    const mediumCountMembersPerOneChat = Math.round(stats.totalMembers / stats.totalConversations);

    const membersPerOneChat = Math.round(stats.totalMembers / stats.totalUsersCount);
``
    const html = `
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
            <div style="display: flex; flex-direction: row; align-items: center;">
            
                 <span id="top_users" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Топ пользователей по чатам"> 
                    ${icons({ name: 'users_outline', realSize: 20, size: 48 })} 
                    <span class="color-text-subhead" style="font-size: 12px">топ</span>
                    <span>Участники</span>
                    <span class="button color-text-subhead" style="font-size: 12px;">
                        ${stats.totalMembers.toLocaleString('ru-RU')}
                    </span>
                </span>

                <p style="margin: 25px;"></p>

                <span id="new_100_chats" class="group-stats"> 
                    ${icons({ name: 'data_stack_lock_outline', realSize: 56, size: 56 })}
                    <span style="font-size: 16px;">Чаты</span>
                    <span class="color-text-subhead" style="font-size: 14px;">
                        ${stats.totalConversations.toLocaleString('ru-RU')}
                    </span>
                </span>

                <p style="margin: 25px;"></p>
                
                <span id="top_groups" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Топ групп по чатам">
                    ${icons({ name: 'users_3_outline', realSize: 24, size: 48 })} 
                    <span class="color-text-subhead" style="font-size: 12px">топ</span>
                    <span>Группы</span>
                    <span class="button color-text-subhead" style="font-size: 12px;">
                        ${stats.totalGroupsCount.toLocaleString('ru-RU')}
                    </span>
                </span>

            </div>
            
            <p style="margin-bottom: 15px;"></p>
            
            <div style="display: flex; width: 100%; flex-direction: column; align-items: center;" class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard">
                <span style="
                    display: flex; 
                    flex-direction: row; 
                    margin-bottom: 3px; 
                    align-items: center; 
                    gap: 5px;
                "> 
                    ${icons({ name: 'smile_outline', size: 16, realSize: 24, fill: 'secondary' })}
                    В среднем на 1 чат приходиться ${mediumCountMembersPerOneChat} ${decOfNum(membersPerOneChat, ['участник', 'участников', 'участников'])}
                </span>
                <span style="
                    display: flex; 
                    flex-direction: row; 
                    align-items: center; 
                    gap: 5px;
                ">
                    ${icons({ name: 'globe_outline', size: 16, realSize: 24, fill: 'secondary' })}
                    Почти каждый участник есть хотя бы в ${membersPerOneChat} ${decOfNum(membersPerOneChat, ['чате', 'чатах', 'чатах'])}
                </span>
            </div>
        </div>
    `;

    modalPage.setContent(html);

    onClicks('showStatistics');
}


async function showTopUsers() {
    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            <a id="back_button_modal_page"> 
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })} Назад 
            </a> 
            ${icons({ name: 'users_outline', realSize: 20, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Топ пользователей по чатам
            </span>
        </div>
    `).content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`).visible();

    const topUsers = await SCAPI.call({
        method: 'extension.getUsersTop',
        parameters: {
            limit: 100
        }
    });

    const usersFromVK = await getUsersOrGroupsFromVK(topUsers.map(user => user.id), true);

    let html = '<div class="ChatSettings__pane"> <div class="ChatSettingsMembersWidget__list">';

    html += topUsers.map((user, index) => {
        return blankMembersTopList({ member: user, memberFromVK: usersFromVK[index], index });
    }).join('');

    html += '</div> </div>';

    modalPage.setContent(html);

    document.getElementById('back_button_modal_page').onclick = showStatistics;
}


async function showTopGroups() {
    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            <a id="back_button_modal_page"> 
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })} Назад 
            </a> 
            ${icons({ name: 'users_3_outline', realSize: 24, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Топ групп по чатам
            </span>
        </div>
    `).content(`<div class="spinner" style="padding: 50px;"> <span class="spinner__animation"> </span></div>`).visible();

    const topGroups = await SCAPI.call({
        method: 'extension.getGroupsTop',
        parameters: {
            limit: 100
        }
    });

    const groupsFromVK = await getUsersOrGroupsFromVK(topGroups.map(group => group.id), true);

    let html = '<div class="ChatSettings__pane"> <div class="ChatSettingsMembersWidget__list">';

    html += topGroups.map((group, index) => {
        return blankMembersTopList({ member: group, memberFromVK: groupsFromVK[index], index });
    }).join('');

    html += '</div> </div>';

    modalPage.setContent(html);

    document.getElementById('back_button_modal_page').onclick = showStatistics;
}


async function showAddChat() {

    const html = `
        <br>
        <div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 5px;">
                <input
                    class="input-text"
                    type="text"
                    id="add_сhat_search"
                    placeholder="vk.me/join/AJQ1d5WK2juv7cfDrybuPh46f"
                    autocomplete="off" 
                    value=""
                    maxlength="100"
                >
                <button title="Добавить" id="add_сhat_button" class="input-button">
                ${icons({ name: 'add', size: 20 })}
                </button>
            </div>
            <span
                id="notifiers_add_chat" 
                style="
                    padding-left: 77px; 
                    display: flex; 
                    justify-content: flex-start; 
                    gap: 5px;
                    font-weight: 400;
                    color: var(--vkui--color_text_subhead);
                "
            >
                Пожалуйста, введите правильную ссылку на чат.
            </span>
        </div>
        <br>
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
            <span style="
                display: flex; 
                flex-direction: column; 
                align-items: center;
                gap: 5px;
                color: var(--vkui--color_text_subhead); 
                font-weight: 500;
                text-align: center;
            ">
                Добавляя чат, Вы помогаете улучшить работу сервиса. Сервису важен каждый чат во ВКонтакте, чтобы он мог предоставить Вам любой чат, который Вы только пожелаете.
            </span>
        </div>
       
    `

    newModalPage(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            ${icons({ name: 'message_add_outline', fill: 'iconsAccent', realSize: 20, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Добавление чата
            </span>
        </div>
    `).content(html).visible();

    const input = document.getElementById('add_сhat_search');
    input.focus();

    let load = false;

    document.getElementById('add_сhat_button').onclick = async () => {
        const [_, key] = input.value.match(/\/join\/([^\s]*)/i) ?? ['', ''];

        if (load) return;

        const notify = document.getElementById('notifiers_add_chat');


        if (key) {
            load = true;
            const response = await SCAPI.call({
                method: 'service.addChats',
                parameters: {
                    urls: [
                        {
                            url: 'vk.me/join/' + key,
                            source: {
                                type: 'user',
                                meta: {
                                    id: services.VKMainUser.id
                                },
                                isHide: false
                            }
                        }
                    ]
                }
            });
            load = false;

            if (response.new) {
                notify.style.color = appearance === 'dark' ? '#A8E4A0' : '#258b17';
                notify.innerText = 'Чат добавлен! Благодарим Вас за помощь.';
            } else if (response.old) {
                notify.style.color = appearance === 'dark' ? '#f6c254' : '#df9700';
                notify.innerText = 'Этот чат уже добавлен.';
            } else if (response.errors) {
                notify.style.color = '#FD324A';
                notify.innerText = 'Ссылка на этот чат недействительна.';
            }
        } else {
            notify.style.color = 'var(--vkui--color_text_subhead)';
            notify.innerHTML = `Пожалуйста, введите правильную ссылку на чат.`
        }
    }
}