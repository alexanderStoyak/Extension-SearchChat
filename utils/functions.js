function random(x, y) {
    return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
}


function pick(array) {
    return array[random(array.length - 1)]
}


function noSpecialCharacters(text) {
    return text.replace(/[^a-zA-Z0-9а-яА-Я ]/g, (match) => '\\' + match);
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


async function checkValidToken() {
    if (!services.auth.accessToken) {
        if (
            !services.auth.accessToken
            || !services.timeStampAuthModalPage
            || services.timeStampAuthModalPage < +new Date
        ) {
            authModalPage();
        }
        return false;
    } else {
        const user = await VKAPI.isValid();
        if (!user) {
            await vkAuth();
        } else {
            GM_setValue('VKMainUser', services.VKMainUser = user);
        }

        services.profileFromSC = await SCAPI.call({ method: "extension.getUser" });
        if (!services.profileFromSC) {
            return false;
        }
    }

    return true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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


    return response.flat();
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
    chats: false,
    addChats: false
};
let currentChats = {
    foundChats: {
        chats: []
    }
};
async function searchChats({ isCurrent = false, offset = 0 }) {

    if (load.chats) return;
    else load.chats = true;

    let parameters = {
        title: filters.title,
        onlyWithFriends: filters.onlyWithFriends,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        maxMembers: filters.maxUsers,
        minMembers: filters.minUsers,
        isHistory: filters.isHistory,
        isActive: filters.isActive,
        offset,
    }

    let user;
    if (filters.link) {
        user = (await getUsersOrGroupsFromVK([filters.link]))[0];
        if (user) {
            parameters.userId = user.first_name ? user.id : -user.id;
        }
    }

    const title = (foundChats, subTitle) =>
        titleModalPage({
            before: 'Чаты',
            after: foundChats ? `${foundChats.toLocaleString('ru-RU')}шт. ` : '',
            subTitle: subTitle,
        })


    modalPage.new(
        title(0, blankFiltersSearchChats({ user }))
    ).setLoad(services.pick.searchChats).visible();
    onClicks('searchChats', { offset });

    let foundChats;
    if (!isCurrent) {
        foundChats = await SCAPI.call({ parameters });

        currentChats = {
            foundChats,
            user,
            offset
        };
    } else {
        user = currentChats.user;
        foundChats = currentChats.foundChats;
        parameters.offset, offset = currentChats.offset;
    }

    if (foundChats.accessDenied) {
        return load.chats = false;
    }

    if (!foundChats.found) {
        load.chats = false;
        modalPage.setContent(
            blankNotFound(
                icons({ name: 'ghost_simple_outline', realSize: 36, size: 86, }),
                'По фильтрам ничего не найдено',
                { id: 'reset_filters', text: 'Сбросить фильтры' }
            )
        ).setTitle(
            title(
                foundChats.found,
                blankFiltersSearchChats({ offset, user, foundChats: foundChats.found })
            )
        );

        return onClicks('searchChats', { offset });
    }

    const [creators, friends] = await Promise.all([
        getUsersOrGroupsFromVK(
            foundChats.chats.map(chat => chat.creator),
            true
        ),
        getFriends()
    ]);

    
    const listChatsHTML = foundChats.chats.map(chat => blankChat({
        chat,
        friends,
        creator: creators.find(creator => creator.id === Math.abs(chat.creator))
    })
    ).join('<br style="display: block; margin: 10px; content: \'\';">');

    modalPage.setContent(listChatsHTML)
        .setTitle(
            title(
                foundChats.found,
                blankFiltersSearchChats({ offset, user, foundChats: foundChats.found, countListChats: foundChats.chats.length })
            )
        );

    onClicks('searchChats', { offset, friends });

    load.chats = false;
}


async function authModalPage() {
    const html = `
            <div class="ProfileModalInfoHeadline" style="padding: 10px;">
                <span style="display: block; gap: 5px; text-align: center; font-size: 13px;">
                    Расширение «ПоискЧата» — это инструмент, разработанный для удобного поиска чатов в социальной сети ВКонтакте. Оно предоставляет возможность пользователям быстро найти нужный чат, используя различные фильтры и параметры.
                    <br/>В настоящее время расширение находится на стадии активной разработки, поэтому мы регулярно выпускаем обновления, внедряем новые функции и исправляем ошибки. Чтобы быть в курсе всех последних обновлений, рекомендуем подписаться на наш <a style="color: #71aaeb;" target="_blank" href="${services.telegramChannelURL}">телеграм-канал</a>, где мы делимся информацией о новых возможностях расширения.
                    <br/>С помощью расширения Вы можете осуществлять поиск чатов по их названиям, что позволяет быстро найти нужную беседу. Кроме того, Вы можете использовать различные фильтры для уточнения результатов поиска. Например, Вы можете фильтровать чаты по участникам, чтобы найти только те, в которых участвует определенный пользователь или группа людей. Также есть возможность фильтровать чаты по Вашим друзьям, чтобы быстро найти те беседы, в которых они присутствуют.
                    <br/>
                    
                    ${blankSeparator('margin-top: 12px; margin-bottom: 12px;')}
                    <span style="color: ${appearance.get() === 'dark' ? '#f6c254' : '#df9700'};">
                        Для использования расширения необходима авторизация, которая будет выполняться путем получения Вашего токена ВКонтакте с помощью приложения «<a style="color: #71aaeb;" target="_blank" href="${services.auth.urlByGetCode}">ПоискЧата</a>».
                    </span>
          
                    ${blankSeparator('margin-top: 12px; margin-bottom: 12px;')}
                    <span> 
                        Ваш токен будет сохранен только на Вашем компьютере (локально) и будет действителен только в течение 24 часов. По истечении этого времени будет получен новый токен, чтобы гарантировать его актуальность во время использования расширения. Таким образом, фактическое хранение токена на сервере невозможно. 
                    </span>
                    
                    ${blankSeparator('margin-top: 12px; margin-bottom: 12px;')}
                    Пожалуйста, нажмите на кнопку: 
                    <span style="
                        display: inline-block; 
                        font-weight: 500; 
                        padding: 0 .5em; 
                        line-height: 1.5em; 
                        max-width: max-content; 
                        border-radius: 50px;"
                        id="button_auth_for_modal_page"
                        class="btn"
                    >
                        Подтвердить регистрацию
                    </span>
                    <br/>В ином случае функционал расширения не будет работать.
                </span>
            </div>
    `;

    modalPage.new(titleModalPage({ before: 'Авторизация' })).setContent(html).visible();


    const buttonAuthForModalPage = document.getElementById('button_auth_for_modal_page');
    buttonAuthForModalPage.onclick = async () => {
        let info = 'Регистрация учетной записи в расширении ПоискЧата..</br></br>';

        modalPage.setLoad([info]);
        const isValid = await vkAuth();

        if (!isValid) {
            return modalPage.setLoad([info + 'Неизвестная ошибка, попробуйте еще раз']);
        }

        modalPage.setLoad([info + 'Авторизованный, VK токен получен.</br></br>Перезагружаю вкладку для начала работы расширения']);
        setTimeout(() => location.reload(), 2_000);
    };

    GM_setValue('timeStampAuthModalPage', services.timeStampAuthModalPage = Infinity);
}


async function showUsersChat(indexChatOrChat, friends, backFunction, offset = 0, search) {
    let chat = {};
    if (typeof indexChatOrChat === 'object') {
        chat = indexChatOrChat;
    } else {
        chat = currentChats.foundChats.chats[indexChatOrChat];
    }

    chat = structuredClone(chat);

    const chatPhoto = chat.photo
        ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
        : 'https://vk.com/images/community_200.png';

    const title = subTitle => titleModalPage({
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `,
        title: 'Участники',
        before: { title: deXSS(chat.title), icon: chatPhoto },
        after: `${chat.membersCount.toLocaleString('ru-RU')}уч.`,
        subTitle: `
            ${blankInputSearch({ id: 'search_users_chat', value: search })}
            ${subTitle || blankPages({})}
        `
    });

    modalPage.new(title()).setLoad(services.pick.showUsersChat).visible();


    const chunksMembersList = chunk(chat.members, 5_000);
    let promises = [];
    for (const chunk of chunksMembersList) {
        promises.push(getUsersOrGroupsFromVK(chunk, true));
    }


    let membersList = (await Promise.all(promises)).flat();

    const onlineMembers = membersList.filter(member => member.online).length;

    membersList = membersList.filter(member =>
        search ?
            new RegExp(noSpecialCharacters(search), 'i')
                .test(member.first_name ? `${member.first_name} ${member.last_name}` : member.name)
            : true
    );

    const membersCount = membersList.length;

    const friendsIds = friends.map(friend => friend.id);
    const creator = membersList.find(member => member.id === Math.abs(chat.creator));

    const creatorIndex = membersList.findIndex(member => member.id === Math.abs(chat.creator));
    if (creatorIndex !== -1) {
        membersList.splice(membersList.findIndex(member => member.id === Math.abs(chat.creator)), 1);
        if (creator && offset === 0) {
            membersList.unshift(creator);
        }
    }

    if (membersCount < offset) {
        offset = 0;
    }

    const currentPage = Math.round(offset / 50 !== 0 ? offset / 50 + 1 : 1);
    const totalPage = Math.ceil(membersCount / 50 || 1);

    const sortedMembersList = membersList.filter(member => friendsIds.includes(member.id))
        .concat(
            membersList.filter(member => !member.first_name),
            membersList.filter(member => !friendsIds.includes(member.id) && member.first_name)
                .sort((a, b) => b.online - a.online)
        ).splice(offset > 0 ? offset - 1 : offset, 50);


    if (!sortedMembersList.length && !creator) {
        modalPage.setContent(
            blankNotFound(
                icons({ name: 'ghost_simple_outline', realSize: 36, size: 86, }),
                search ? 'Пользователи не найдены' : 'Этот чат без участников'
            )
        ).setTitle(title(blankPages({ found: 0 })));
        return onClicks('showUsersChat', { indexChatOrChat, friends, backFunction, offset });
    }


    let htmlUsers = '';

    for (const member of sortedMembersList) {
        htmlUsers += blankMembersList({ member, creator: creator ? creator.id : 0, friends });
    }

    const html = `
        <div class="ChatSettings__pane"> 
            <div class="ChatSettingsMembersWidget__list" id="chat_users">
                ${htmlUsers}
            </div> 
        </div>
    `;

    modalPage.setContent(html)
        .setTitle(
            title(
                `
                    ${blankPages({ found: membersCount, inOnePage: sortedMembersList.length, offset, currentPage, totalPage })}
                    <span style="display: flex; gap: 5px;">
                        ${icons({ name: 'users_outline', size: 16, realSize: 20, fill: 'secondary' })}
                        <span style="padding-right: 10px; color: #99a2ad;">
                            ${onlineMembers.toLocaleString('ru-RU')} ${decOfNum(onlineMembers, ['участник', 'участника', 'участников'])} в сети
                        </span>
                    </span>
                `
            )
        );

    onClicks('showUsersChat', { indexChatOrChat, friends, backFunction, offset });
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

    const response = await VKAPI.call('execute', { code });

    return response;
}


// https://angel-rs.github.io/css-color-filter-generator/
const iconColors = {
    accent: 'brightness(0) saturate(100%) invert(66%) sepia(13%) saturate(1970%) hue-rotate(180deg) brightness(98%) contrast(88%);',
    textAccentThemed: 'brightness(0) saturate(100%) invert(43%) sepia(35%) saturate(1094%) hue-rotate(172deg) brightness(83%) contrast(81%);',
    secondary: 'brightness(0) saturate(100%) invert(55%) sepia(0%) saturate(1%) hue-rotate(295deg) brightness(94%) contrast(96%);',
    white: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(203deg) brightness(112%) contrast(109%);',
    iconsAccent: appearance.get() === 'dark'
        ? 'brightness(0) saturate(100%) invert(59%) sepia(9%) saturate(3344%) hue-rotate(175deg) brightness(75%) contrast(92%);'
        : 'brightness(0) saturate(100%) invert(78%) sepia(22%) saturate(6954%) hue-rotate(184deg) brightness(100%) contrast(84%);',
    original: ''
}
function icons({ name, realSize = 24, size = realSize, fill = 'accent', leftGap = 0, rightGap = 0 }) {
    return `
        <svg 
            fill="currentColor" 
            stroke="currentColor"
            width="${size + rightGap}" 
            height="${size}"
            style="${iconColors[fill] ? `filter: ${iconColors[fill]};` : ''} padding-left: ${leftGap}px; padding-right: ${rightGap}px;"
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
    modalPage.new(titleModalPage({ before: 'Статистика и топы' }))
        .setLoad().visible();


    const stats = await SCAPI.call({ method: 'extension.getStats' });

    if (stats.accessDenied) {
        return
    }

    const mediumCountMembersPerOneChat = Math.round(stats.totalMembers / stats.totalConversations);

    const membersPerOneChat = Math.round(stats.totalMembers / stats.totalUsersCount);

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

            <div class="separator" style="width: 100%;"></div>

            <div style="display: flex; flex-direction: row; align-items: center;">
                <span class="group-stats"> 
                    ${icons({ name: 'view', size: 56, realSize: 16 })}
                    <span class="color-text-subhead" style="font-size: 14px;">
                        ${stats.totalViews.toLocaleString('ru-RU')}
                    </span>
                    <span style="font-size: 16px;">${decOfNum(stats.totalViews, ['Просмотр', 'Просмотра', 'Просмотров'])}</span>
                    <span class="color-text-subhead" style="font-size: 12px">у всех чатов</span>
                </span>
            </div>
            
            <p style="margin-bottom: 15px;"></p>
            
            ${blankQuote(`
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px;">
                    ${icons({ name: 'smile_outline', size: 16, realSize: 24, fill: 'accent' })}
                    В среднем на 1 чат приходиться ${mediumCountMembersPerOneChat} ${decOfNum(membersPerOneChat, ['участник', 'участников', 'участников'])}
                </span>
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px;">
                    ${icons({ name: 'globe_outline', size: 16, realSize: 24, fill: 'accent' })}
                    Почти каждый участник есть хотя бы в ${membersPerOneChat} ${decOfNum(membersPerOneChat, ['чате', 'чатах', 'чатах'])}
                </span>
            `)}
            </div>
        </div>
    `;

    modalPage.setContent(html);

    onClicks('showStatistics');
}


async function showTopUsers() {
    modalPage.new(titleModalPage({
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `,
        title: 'Топ',
        before: { 
            title: 'Пользователи', 
            icon: icons({ name: 'users_outline', realSize: 20, size: 28 }) 
        }
    })).setLoad().visible();


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
    modalPage.new(    titleModalPage({
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `,
        title: 'Топ',
        before: { 
            title: 'Группы', 
            icon: icons({ name: 'users_3_outline', realSize: 24, size: 28 })
        }
    })).setLoad().visible();

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
                    padding-left: 102px; 
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
            ${blankQuote(`
                <span style="text-align: center;">
                    Добавляя чат, Вы помогаете улучшить работу сервиса. Сервису важен каждый чат во ВКонтакте, чтобы он мог предоставить Вам любой чат, который Вы только пожелаете.
                </span>
            `)}
        </div>
       
    `

    modalPage.new(titleModalPage({ before: 'Добавление чата' })).setContent(html).visible();

    const input = document.getElementById('add_сhat_search');
    input.setSelectionRange(input.value.length, input.value.length);
    input.focus();

    document.getElementById('add_сhat_button').onclick = async () => {
        const [_, key] = input.value.match(/\/join\/([^\s]*)/i) ?? ['', ''];

        if (load.addChats) return;

        const notify = document.getElementById('notifiers_add_chat');


        if (key) {
            load.addChats = true;
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
            load.addChats = false;

            if (response.new) {
                notify.style.color = appearance.get() === 'dark' ? '#A8E4A0' : '#258b17';
                notify.innerText = 'Чат добавлен! Благодарим Вас за помощь.';
            } else if (response.old) {
                notify.style.color = appearance.get() === 'dark' ? '#f6c254' : '#df9700';
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


async function showTopViewsChats() {
    modalPage.new(titleModalPage({
        title: 'Админ панель',
        before: 'Просмотры',
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `
    })).setLoad().visible();


    (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
        showAdminPanel({ isCurrent: true });
    };

    const users = await SCAPI.call({ method: "extension.getTopViewsChats" });

    const usersFromVK = await getUsersOrGroupsFromVK(users.map(user => user.id), true);

    let htmlUsers = usersFromVK.map((member, index) => {
        const user = users[index];
        const subTitle = user.viewChats.self ? ` Просмотрел ${user.viewChats.self.toLocaleString('ru-RU')} ${decOfNum(user.viewChats.self, ['чат', 'чата', 'чатов'])}` : 'Просмотрел 0 чатов';

        return blankMembersList({ member, creator: 0, friends: [{}], subTitle });
    }).join('');

    const html = `
        <div class="ChatSettings__pane"> 
            <div class="ChatSettingsMembersWidget__list" id="chat_users">
                ${htmlUsers}
            </div> 
        </div>
    `;

    modalPage.setContent(html);
}


async function showAdminPanel() {
    modalPage.new(titleModalPage({
        title: 'Админ панель',
        icon: icons({ name: 'wrench_outline', fill: 'iconsAccent', realSize: 28, size: 28 })
    })).setLoad().visible();

    const html = `
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
            <div style="display: flex; flex-direction: row; align-items: center;">
            
                 <span id="top_views_chats" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Топ пользователей по чатам"> 
                    ${icons({ name: 'api_outline', realSize: 20, size: 48 })} 
                    <span class="button" style="font-size: 12px;">Просмотры</span>
                </span>

            </div>
        </div>
    `;

    modalPage.setContent(html);

    document.getElementById('top_views_chats').onclick = () => {
        showTopViewsChats();
    }
}


async function showShop() {
    modalPage.new(titleModalPage({
        before: 'Товары',
    })).setLoad().visible();

    const html = `
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
        
            <div style="display: flex; flex-direction: row; align-items: center;">

                <span id="subscription" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Описание товара"> 
                    ${icons({ name: 'donut_circle_fill_yellow', realSize: 20, size: 45, fill: 'original' })}
                    <span class="color-text-subhead" style="font-size: 12px">месяц</span>
                    <span class="button" style="font-size: 12px;">Подписка</span>
                    <span class="button color-text-subhead" style="font-size: 12px;">
                        250 руб.
                    </span>
                </span>

                <p style="margin: 25px;"></p>

                <span id="my_hide" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Описание товара"> 
                    ${icons({ name: 'ghost_simple_outline', realSize: 28, size: 48 })}
                    <span class="color-text-subhead" style="font-size: 12px">навсегда</span>
                    <span class="button" style="font-size: 12px;">Скрыть себя</span>
                    <span class="button color-text-subhead" style="font-size: 12px;">
                        500 руб.
                    </span>
                </span>

            </div>

            ${services.profileFromSC.isSubscriptionValid ?
                `
                    <p style="margin-bottom: 10px;"></p>
                    ${blankQuote(`
                        <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; line-height: 30px;">
                            ${icons({ name: 'donut_circle_fill_yellow', size: 12, realSize: 20, fill: 'original' })}
                            Ваша подписка активна до ${moment(services.profileFromSC.subscription.expired).fromNow().toLowerCase()}
                        </span>
                    `)}
                `
                : ''
            }

        </div>
    `;

    modalPage.setContent(html);

    onClicks('showShop', {})
}

const styleLi = 'list-style-type: none; padding: 3px 5px 3px 5px;';
const styleUi = 'margin-left: 0; padding-left: 0;';


const descriptionProduct = {
    'subscription': {
        title: 'Подписка',
        tableСontents: `
            <b style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; justify-content: center;">
                ${icons({name: 'star_circle_fill_yellow', realSize: 16, size: 14, fill: 'original'})} Больше возможностей с подпиской!
            </b>
        `,
        price: 250,
        description: `
            ${blankQuote(
                `
                    <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                        ${icons({name: 'unlock', realSize: 12, size: 14})} Доступ к чатам любого пользователя или группы ВКонтакте.
                    </span>
                    <ui style="${styleUi}">
                        <li style="${styleLi}"> # Вызывает удивление у Вашей жертвы, так как не каждый способен заходить в чаты пользователя при помощи всего двух кнопок. </li>
                        <li style="${styleLi}"> # При необходимости использовать чаты для обхода черного списка (ЧС) или закрытых личных сообщений (ЛС) </li>
                        <li style="${styleLi}"> # Исходя из найденных чатов и их тематики, можно узнать, чем увлекается или где живет ваша жертва. </li>
                        <li style="${styleLi}"> # Можно найти школьные, рабочие, городские беседы и другие подобные чаты. </li>
                        <li style="${styleLi}"> # Если Вы увидели чат у пользователя и хотите войти в него, попробуйте найти его у нас. </li>
                        <li style="${styleLi}"> # Активные чаты: как правило, чем общительнее Ваш друг, тем активнее его чаты. </li>
                    </ui>
                `
            )}
            <br/>
            ${blankQuote(`
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                    ${icons({name: 'cards_2', realSize: 12, size: 14})} Увеличения лимитов на страницы при просмотре чатов.
                </span>
                # У обычных пользователей максимальное количество страниц, которые они могут просмотреть, составляет 15. У пользователей с подпиской максимальное количество страниц увеличено до 500, что дает возможность пролистать 7,500 чатов.
            `)}
            <br/>
            ${blankQuote(`
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                    ${icons({name: 'list_plus_outline', realSize: 20, size: 14})} Диапазон участников в чатах.
                </span>
                # Возможность установки диапазона количества участников в чатах, например, от 10 до 500.
            `)}
            <br/>
            ${blankQuote(`
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                    ${icons({name: 'archive_outline', realSize: 20, size: 16})} Поиск из истории чатов.
                </span>
                # Поиск в истории чатов будет осуществляться по старым названиям, а также по чатам, где участвовал участник или Ваши друзья.
            `)}
            <br/>
            <br/>
            ${blankQuote(`
                <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                    ${icons({name: 'help_outline', realSize: 24, size: 14})} Почему платно?
                </span>
                Мы сделали подписку платной, поскольку функции с подпиской требуют дополнительных расходов, в том числе на аренду серверов. 
                Вклад подписчиков позволяет нам покрывать эти расходы и помогает «ПоискЧата» оставаться бесплатным для всех пользователей.
                
            `)}
        `,
    },
    'myHide': {
        title: 'Скрыть чаты',
        tableСontents: `
            <b style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; justify-content: center;">
                ${icons({name: 'lock', realSize: 12, size: 14})} Гарантированная конфиденциальность
            </b>
        `,
        price: 500,
        description: blankQuote(`
            <span style="display: flex; flex-direction: row; align-items: center; gap: 5px; font-size: 16px; color: #828282;"> 
                ${icons({name: 'brain_outline', realSize: 28, size: 15})} Мы понимаем,
            </span>
            что многим пользователям не нравится, когда кто-то несанкционированно заходит в их любимые чаты. 
            Это может серьезно нарушить комфорт и безопасность пользователей, особенно если чат является школьным или городским. Кроме того, информация, представленная в профиле чата, может раскрыть много о человеке, его интересах, месте жительства, образовании и месте работы.
            Мы предлагаем функцию скрытия чатов, чтобы Вы могли защитить свою приватность. 
            Это позволит предотвратить несанкционированный доступ к Вашим чатам.
            Скрытие чатов — это важная функция, которая помогает защитить Вас от нежелательного вмешательства и сохранить Вашу приватность.
            Ваши чаты останутся полностью скрыты от посторонних глаз.
            <br/>
            Ни один сервис, который использует наше API не сможет получить доступ к Вашим чатам, включая и это расширение.
        `)
    }
}


function showDescriptionProduct(productId) {
    const product = descriptionProduct[productId];

    modalPage.new(titleModalPage({
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `,
        title: 'Товары',
        before: product.title,
        after: 'описание'
    })).visible();

    modalPage.setContent(`
        <div style="display: block; gap: 5px; text-align: center; margin-top: 3px; padding: 10px;">
            ${product.tableСontents}
            <div class="separator"></div>
            <span style="font-size: 13px;">${product.description}</span>

            <div style="display: flex; padding-top: 15px; align-items: flex-end; justify-content: flex-end;">
                <a href="https://t.me/istoyak" target="_blank" class="FlatButton FlatButton--primary FlatButton--size-m" type="button">
                    <span class="FlatButton__in">
                        <span class="FlatButton__content">Купить за ${product.price}₽</span>
                    </span>
                </a>
            </div>
        </div>
    `);

    onClicks('showDescriptionProduct', {});
}


async function showProfile({ id }) {
    if (!id) {
        id = services.VKMainUser.id;
    }

    modalPage.new(titleModalPage({
        before: 'Профиль',
        subTitle: blankInputSearch({ id: 'search_user_profile', placeholder: 'Ссылка на страницу', value: id }),
    })).setLoad(['Загружаем...']).visible();

    const [userFromVK] = await getUsersOrGroupsFromVK([id]);
    if (!userFromVK || !userFromVK.first_name) {
        modalPage.setContent(
            blankNotFound(
                icons({ name: 'user_slash_outline', realSize: 20, size: 48 }),
                'Такого профиля ВКонтакте не существует'
            )
        );

        return onClicks('showProfile', {});
    }

    const [userFromSC] = await Promise.all([
        SCAPI.call({
            method: 'extension.getUser',
            parameters: { id: userFromVK.id, full: true }
        })
    ]);

    if (userFromSC.accessDenied) {
        return;
    }

    let HTMLNewChat = '';

    let friends = [], creator = {};

    const queriesByUsers = await getUsersOrGroupsFromVK(userFromSC.history?.queriesByUsers ?? [], true);

    if (userFromSC.newChat) {
        [friends, [creator]] = await Promise.all([
            getFriends(),
            getUsersOrGroupsFromVK([userFromSC.newChat.creator])
        ]);

        HTMLNewChat = `
            <br/>
            <div style="margin-left: 3px; margin-bottom: 3px; font-size: 15px; font-weight: bold; gap: 5px; display: flex; align-items: center; justify-content: center;">
                ${icons({ name: 'new', fill: 'secondary', size: 24, realSize: 16 })}
                Самый новый чат с ${userFromVK.sex === 1 ? 'ней' : 'ним'}
            </div>
            ${
                blankChat({
                    chat: userFromSC.newChat,
                    friends: friends,
                    creator: creator
                })
            }
            ${userFromSC.stats.member > 1 ?
                `
                        <span style="display: flex; justify-content: center; text-align: center; margin-top: 3px;">
                            <a id="full_chats_from_profile">Полный список</a>
                        </span>
                `
                : ''
            }
        `;
    }

    if (!userFromSC.viewChats.self) userFromSC.viewChats.self = 0;
    if (!userFromSC.viewChats.other) userFromSC.viewChats.other = 0;

    const nameHTML = `
        <span style="max-width: 240px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
            ${deXSS(`${userFromVK.first_name} ${userFromVK.last_name}`)}
        </span>
    `;

    const nameString = deXSS(`${userFromVK.first_name} ${userFromVK.last_name}`);


    const userLastChekUsersChats = queriesByUsers.map(member => {
        const typeMention = member?.first_name ? 'id' : 'club';

        const linkMember = `https://vk.com/${typeMention}${member.id}`;
        const nameHTML = typeMention === 'id'
            ? `<span style="max-width: 180px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(member.first_name)} ${deXSS(member.last_name)}</span>`
            : `Группа «<span style="max-width: 180px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(member.name)}</span>»`;
    
        const nameString = deXSS(typeMention === 'id'
            ? `${member.first_name} ${member.last_name}`
            : `Группа «${member.name}»`
        );
        
        const isFriend = friends.find(friend => member.id === friend.id) !== undefined;

        return `
            <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">
                <div style="width: 20px; height: 20px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                    <img class="vkuiImageBase__img" src="${member.photo_100 || ''}">
                </div>

                <a title="${nameString}" target="_blank" href="${linkMember}" style="display: flex; ${isFriend ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''}">
                    ${nameHTML}
                </a>
            </div>
        `
    }).join(',⠀');

    const userLastChekByTitleChats = userFromSC.history?.queriesByTitle?.map(title => 
        `
            <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">
                ${deXSS(title)}
            </div>
        `    
    ).join(',⠀');

    modalPage.setContent(`
        <div class="${classGroup}">

            ${userFromSC.isSubscriptionValid ? 
                `
                    <span style="display: flex; flex-direction: row; font-size: 14px; color: #99a2ad; font-weight: bold; justify-content: center; gap: 5px;">
                        ${icons({ name: 'donut_circle_fill_yellow', size: 16, realSize: 20, fill: 'original' })}
                        <div>${userFromSC.isSubscriptionValid ? 'Подписчик' : `${userFromVK.sex === 1 ? 'Была' : 'Был'} подписчиком`}. Активно до ${moment(userFromSC.subscription.expired).format('DD.MM.YYYY')}, куплена ${moment(userFromSC.subscription.created).fromNow().toLowerCase()}</div>
                    </span>
                    <div class="separator" style="padding-top: 5px;"></div>
                `
                : ''
            }
        
            <div style="display: flex; align-items: center; justify-content: space-between; padding-left: 10px; padding-right: 10px;">

                <div style="display: flex; align-items: center; flex-direction: column;">
                    <div style="width: 100px; height: 100px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-100 vkuiImageBase--loaded" role="img">
                        <img class="vkuiImageBase__img" src="${userFromVK.photo_100 || ''}">
                    </div>

                    <div style="display: flex; align-items: center; flex-direction: row; justify-content: center;">
                        <a title="${nameString}" href="https://vk.com/id${userFromVK.id}" target="_blank" style="display: flex; align-items: center; flex-direction: row; font-size: 20px; font-weight: bold; padding-top: 10px; color: var(--vkui--color_text_primary); text-decoration-color: var(--vkui--color_text_primary);">
                            ${nameHTML}
                        </a>
                    </div>

                </div>

                <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; width: 100%; height: 100%;">
                    <span style="display: flex; flex-direction: row; gap: 5px; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                        ${icons({ name: 'face_id_outline', size: 16, realSize: 28, fill: 'secondary' })}
                        Интересовались профилем ${userFromSC.views.toLocaleString('ru-RU')} ${decOfNum(userFromSC.views, ['раз', 'раза', 'раз'])}.
                    </span>

                    <span style="display: flex; flex-direction: row; gap: 5px; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                        ${icons({ name: 'api_outline', size: 16, realSize: 20, fill: 'secondary' })}
                        ${userFromVK.sex === 1 ? 'Использовала' : 'Использовал'} расширение ${userFromSC.useExtension.toLocaleString('ru-RU')} ${decOfNum(userFromSC.useExtension, ['раз', 'раза', 'раз'])}.
                    </span>

                    ${userFromSC.isBanned ? 
                        `
                            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #fce100; font-weight: bold;"> 
                                ${icons({ name: 'user_slash_outline', size: 16, realSize: 20, fill: 'secondary' })}
                                Аккаунт заблокирован.
                            </span>
                        `
                        : ''
                    }

                    ${userFromSC.isHide ? 
                        `
                            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                                ${icons({ name: 'hide_outline', size: 16, fill: 'secondary' })}
                                Чаты и профиль этого аккаунта скрыты.
                            </span>
                        `
                        : ''
                    }
                </div>
            </div>

        </div>

        <br style="display: block; margin: 10px; content: '';">

        <div class="${classGroup}" style="display: flex; justify-content: space-between;">
            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                ${icons({ name: 'search_stars_outline', size: 16, fill: 'secondary' })}
                ${userFromVK.sex === 1 ? 'Найдена' : 'Найден'} в ${userFromSC.stats.member.toLocaleString('ru-RU')} ${decOfNum(userFromSC.stats.member, ['чате', 'чатах', 'чатах'])}
            </span>

            <div class="ver-separator"></div>

            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                ${icons({ name: 'crown_outline', size: 16, realSize: 28, fill: 'secondary' })}
                Создатель в ${userFromSC.stats.creator.toLocaleString('ru-RU')} ${decOfNum(userFromSC.stats.creator, ['чате', 'чатах', 'чатах'])}
            </span>

            <div class="ver-separator"></div>

            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold;"> 
                ${icons({ name: 'add', size: 16, fill: 'secondary' })}
                ${userFromVK.sex === 1 ? 'Добавила' : 'Добавил'} ${userFromSC.stats.added.toLocaleString('ru-RU')} ${decOfNum(userFromSC.stats.added, ['чат', 'чата', 'чатов'])}
            </span>
        </div>

        <div class="${classGroup}" style="display: flex; justify-content: space-between;">
            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold; padding-left: 5%;"> 
                ${icons({ name: 'chats_outline', size: 16, realSize: 28, fill: 'secondary' })}
                Просмотрели ${userFromSC.viewChats.other.toLocaleString('ru-RU')} ${decOfNum(userFromSC.viewChats.other, ['чат', 'чата', 'чатов'])} с ${userFromVK.sex === 1 ? 'ней' : 'ним'}
            </span>

            <div class="ver-separator"></div>
            
            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold; padding-right: 5%;"> 
                ${icons({ name: 'view', size: 16, fill: 'secondary' })}
                ${userFromVK.sex === 1 ? 'Просмотрела' : 'Просмотрел'} ${userFromSC.viewChats.self.toLocaleString('ru-RU')} ${decOfNum(userFromSC.viewChats.self, ['чат', 'чата', 'чатов'])}
            </span>

        </div>

        ${HTMLNewChat}


        <br/>
        <div style="display: flex; margin-bottom: 3px; font-size: 15px; font-weight: bold; gap: 5px; flex-direction: row; justify-content: center; align-items: center;">
            ${icons({ name: 'archive_outline', size: 24, realSize: 28, fill: 'secondary' })}
            История пользователя
        </div>

        <div class="${classGroup}" style="display: flex; justify-content: space-between;">
            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold; padding-left: 5%;"> 
                ${icons({ name: 'door_arrow_left_outline', size: 16, realSize: 24, fill: 'secondary' })}
                ${userFromVK.sex === 1 ? 'Присоединилась' : 'Присоединился'} в ${userFromSC.stats.entered.toLocaleString('ru-RU')} ${decOfNum(userFromSC.stats.entered, ['чата', 'чата', 'чатов'])}
            </span>

            <div class="ver-separator"></div>
            
            <span style="display: flex; gap: 5px; flex-direction: row; font-size: 12px; color: #99a2ad; font-weight: bold; padding-right: 5%;"> 
                ${icons({ name: 'door_arrow_right_outline', size: 16, realSize: 24, fill: 'secondary' })}
                ${userFromVK.sex === 1 ? 'Вышла' : 'Вышел'} из ${userFromSC.stats.exited.toLocaleString('ru-RU')} ${decOfNum(userFromSC.stats.exited, ['чата', 'чатов', 'чатов'])}
            </span>
        </div>

        ${
            userLastChekUsersChats 
                ? `
                    <div class="${classGroup}" style="display: flex; flex-direction: fow;">
                        <span style="display: flex; word-break: break-all; flex-wrap: wrap; text-align: center;">
                            <span style="font-size: 14px; color: #99a2ad; font-weight: bold;"> 
                                Чьи чаты ${userFromVK.sex === 1 ? 'смотрела' : 'смотрел'} последний раз:⠀
                            </span>
                            ${userLastChekUsersChats}
                        </span>
                    </div>
                ` 
                : ''
        }

        ${
            userLastChekByTitleChats
                ? `
                    <div class="${classGroup}" style="display: flex; flex-direction: fow;">
                        <span style="display: flex; word-break: break-all; flex-wrap: wrap; text-align: center;">
                            <span style="font-size: 14px; color: #99a2ad; font-weight: bold;"> 
                                Последние запросы по названиям:⠀
                            </span>
                            ${userLastChekByTitleChats}
                        </span>
                    </div>
                ` 
                : ''
        }
    `);

    onClicks('showProfile', { id: userFromVK.id, friends, chat: userFromSC.newChat });
}



async function showHistoryChat(indexChatOrChat, backFunction, friends, search = '') {
    let chat = {};
    if (typeof indexChatOrChat === 'object') {
        chat = indexChatOrChat;
    } else {
        chat = currentChats.foundChats.chats[indexChatOrChat];
    }

    chat = structuredClone(chat);

    const chatPhoto = chat.photo
        ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
        : 'https://vk.com/images/community_200.png'; 


    const title = (countTitles, countPhotos, countExitedUsers, countNewUsers) => 
        titleModalPage({
            icon: `
                <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                    ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
                </span>
            `,
            title: 'История чата',
            before: { title: deXSS(chat.title), icon: chatPhoto },
            subTitle: `
                ${blankInputSearch({ id: 'search_users_history', value: search })}
                <span style="display: flex; gap: 5px;">
                    ${icons({ name: 'pencil', size: 16, realSize: 12, fill: 'secondary' })}
                    <span style="padding-right: 10px; color: #99a2ad;">
                        ${countTitles.toLocaleString('ru-RU')} ${decOfNum(countTitles, ['раз', 'раза', 'раз'])} обновлялось название
                    </span>
                </span>
                <span style="display: flex; gap: 5px;">
                    ${icons({ name: 'photos_stack_outline', size: 16, realSize: 24, fill: 'secondary' })}
                    <span style="padding-right: 10px; color: #99a2ad;">
                        ${countPhotos.toLocaleString('ru-RU')} ${decOfNum(countPhotos, ['раз', 'раза', 'раз'])} обновлялось фото
                    </span>
                </span>
                <span style="display: flex; gap: 5px;">
                    ${icons({ name: 'user_minus_outline', size: 16, realSize: 28, fill: 'secondary' })}
                    <span style="padding-right: 10px; color: #99a2ad;">
                        ${countExitedUsers.toLocaleString('ru-RU')} ${decOfNum(countExitedUsers, ['вышедший участник', 'вышедших участника', 'вышедших участников'])}
                    </span>
                </span>
                <span style="display: flex; gap: 5px;">
                ${icons({ name: 'user_add_outline', size: 16, realSize: 28, fill: 'secondary' })}
                    <span style="padding-right: 10px; color: #99a2ad;">
                        ${countNewUsers.toLocaleString('ru-RU')} ${decOfNum(countNewUsers, ['присоединившийся участник', 'присоединившихся участника', 'присоединившихся участников'])}
                    </span>
                </span>
            `
        });

    modalPage.new(
        titleModalPage({
            icon: `
                <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                    ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
                </span>
            `,
            title: 'История чата',
            before: { title: deXSS(chat.title), icon: chatPhoto },
        })
    ).setLoad(['Загружаем историю чата...']).visible();


    if (!chat.history) {
        modalPage.setContent(blankNotFound(
            icons({ name: 'story_outline', size: 56, realSize: 56 }),
            'В этом чате еще нет истории',
        ))

        onClicks('showHistoryChat', { backFunction });
        return;
    }
    

    const history = [
        chat.history.titles?.reverse(),
        chat.history.photos?.reverse(),
        chat.history.exitedUsers?.reverse(),
        chat.history.newUsers?.reverse(),
    ].flat()
    .filter(obj => obj !== undefined)
    .sort((a, b) => new Date(b.date) - new Date(a.date));


    if (!history.length) {
        modalPage.setContent(blankNotFound(
            icons({ name: 'article_box_outline', size: 56, realSize: 16 }),
            'В этом чате еще нет истории',
        ))

        onClicks('showHistoryChat', { backFunction });
        return;
    }

    modalPage.setTitle(
        title(
            chat.history.titles?.length || 0,
            chat.history.photos?.length || 0,
            chat.history.exitedUsers?.length || 0,
            chat.history.newUsers?.length || 0
        )
    )
    
    let HTML = '';


    const chunksHistory = chunk(history.map(({ id }) => id).filter(id => id !== undefined), 5_000);
    let promises = [];

    for (const chunk of chunksHistory) {
        promises.push(getUsersOrGroupsFromVK(chunk, true));
    }

    const usersFromVK = (await Promise.all(promises)).flat().filter(member =>
        search ?
            new RegExp(noSpecialCharacters(search), 'i')
                .test(member.first_name ? `${member.first_name} ${member.last_name}` : member.name)
            : true
    );

    const skipMembers = [];

    history.filter(({ id, title, photo }) => usersFromVK.find(member => (member?.first_name ? member.id : -member.id) === id) || photo || title).forEach(story => {
        const typeStory = story.id ? 'member' : story.title ? 'title' : story.photo ? 'photo' : '';

        if (typeStory === 'member' && !skipMembers.find(id => id === story.id)) {
            skipMembers.push(story.id);

            const news = chat.history.newUsers.filter(newUser => newUser.id === story.id);
            const exits = chat.history.exitedUsers.filter(exitUser => exitUser.id === story.id);

            const member = usersFromVK.find(member => (member?.first_name ? member.id : -member.id) === story.id);
            const typeMention = member?.first_name ? 'id' : 'club';

            const linkMember = `https://vk.com/${typeMention}${member.id}`;
            const nameHTML = typeMention === 'id'
                ? `<span style="max-width: 180px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(member.first_name)} ${deXSS(member.last_name)}</span>`
                : `Группа «<span style="max-width: 180px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(member.name)}</span>»`;
        
            const nameString = deXSS(typeMention === 'id'
                ? `${member.first_name} ${member.last_name}`
                : `Группа «${member.name}»`
            );
            
            const isFriend = friends.find(friend => member.id === friend.id) !== undefined;

            for (const { date } of exits) {
                HTML += `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">

                            <div style="width: 20px; height: 20px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                                <img class="vkuiImageBase__img" src="${member.photo_100 || ''}">
                            </div>

                            <a title="${nameString}" target="_blank" href="${linkMember}" style="display: flex; font-weight: bold; ${isFriend ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''}">
                                ${nameHTML}
                            </a>

                            <span style="display: flex; flex-direction: row; gap: 5px;">
                                ${member.sex !== 2 ? 'вышла' : 'вышел'}
                                <a style="text-decoration-color: #99a2ad; color: #99a2ad;">
                                    ${moment(date).format('DD.MM.YYYY HH:mm')}
                                </a>
                            </span>
                        </div>
                    </div>
                `;
            }


            for (const { date } of news) {
                HTML += `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">

                            <div style="width: 20px; height: 20px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                                <img class="vkuiImageBase__img" src="${member.photo_100 || ''}">
                            </div>

                            <a title="${nameString}" target="_blank" href="${linkMember}" style="display: flex; font-weight: bold; ${isFriend ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''}">
                                ${nameHTML}
                            </a>

                            <span style="display: flex; flex-direction: row; gap: 5px;">
                                ${member.sex !== 2 ? 'присоединилась' : 'присоединился'}
                                <a style="text-decoration-color: #99a2ad; color: #99a2ad;">
                                    ${moment(date).format('DD.MM.YYYY HH:mm')}
                                </a>
                            </span>
                        </div>
                    </div>
                `;
            }
        }

        if (typeStory === 'title') {
            story.title = deXSS(story.title);
            const oldTitle = story.title;

            const sortTitles = history.filter(obj => obj.title);

            const indexNewTitle = sortTitles.findIndex(title => title.title === oldTitle);

            const newTitle = sortTitles[indexNewTitle - 1]?.title || chat.title;

            HTML += `
                <div style="display: flex; align-items: center; justify-content: center;">
                    <div style="display: flex; flex-direction: column; font-weight: 400; color: #99a2ad; align-items: center;">

                        <span style="display: flex; font-weight: bold; flex-direction: row; gap: 5px;">
                            Новое название чата 
                            <a style="text-decoration-color: #99a2ad; font-weight: 500; color: #99a2ad;">
                                ${moment(story.date).format('DD.MM.YYYY HH:mm')}
                            </a>
                        </span>

                        <span style="display: flex; gap: 10px; flex-direction: row; align-items: center;">
                            <span title="${oldTitle}" style="max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                ${oldTitle}
                            </span>
                            
                            ${icons({ name: 'arrow_right', realSize: 12, size: 20, fill: 'secondary' })}
                            
                            <span title="${newTitle}" style="max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                ${newTitle}
                            </span>
                        </span>

                    </div>
                </div>
            `
        }

        if (typeStory === 'photo') {
            const oldPhoto = (story.photo['200'] || story.photo['100'] || story.photo['50']) || 'https://vk.com/images/community_200.png';

            const sortPhotos = history.filter(obj => obj.photo);

            const indexNewPhoto = sortPhotos.findIndex(photo => 
                (
                    (
                        photo.photo['200'] 
                        || photo.photo['100']
                        || photo.photo['50']
                    ) || 'https://vk.com/images/community_200.png'
                ) === oldPhoto
            );

            const newPhoto = 
                (indexNewPhoto && (
                    sortPhotos[indexNewPhoto - 1].photo['200'] 
                    || sortPhotos[indexNewPhoto - 1].photo['100'] 
                    || sortPhotos[indexNewPhoto - 1].photo['50']
                )) || (
                    chat.photo['200']
                    || chat.photo['100'] 
                    || chat.photo['50']
                ) || 'https://vk.com/images/community_200.png';


            HTML += `
                <div style="display: flex; align-items: center; justify-content: center;">
                    <div style="display: flex; flex-direction: column; gap: 3px; font-weight: 400; color: #99a2ad; align-items: center;">

                        <span style="display: flex; font-weight: bold; flex-direction: row; gap: 5px;">
                            Новое фото чата
                            <a style="text-decoration-color: #99a2ad; font-weight: 500; color: #99a2ad;">
                                ${moment(story.date).format('DD.MM.YYYY HH:mm')}
                            </a>
                        </span>

                        <span style="display: flex; gap: 10px; flex-direction: row; align-items: center;">
                            <a href="${oldPhoto}" target="_blank" style="text-decoration: none;" >
                                <div style="width: 58px; height: 58px;">
                                    <div style="width: 58px; height: 58px; box-shadow: 0 0 0 0.1em;"
                                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded" role="img">
                                        <img class="vkuiImageBase__img" src="${oldPhoto}">
                                    </div>
                                </div>
                            </a>
                            
                            ${icons({ name: 'arrow_right', realSize: 12, size: 28, fill: 'secondary' })}
                            
                            <a href="${newPhoto}" target="_blank" style="text-decoration: none;" >
                                <div style="width: 58px; height: 58px;">
                                    <div style="width: 58px; height: 58px; box-shadow: 0 0 0 0.1em;"
                                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded" role="img">
                                        <img class="vkuiImageBase__img" src="${newPhoto}">
                                    </div>
                                </div>
                            </a>
                        </span>

                    </div>
                </div>
            `
        }
    });

    modalPage.setContent(`
        <div style="display: flex; flex-direction: column; gap: 10px; min-height: 400px; padding-top: 10px; padding-bottom: 10px;">
            ${HTML}
        </div>
    `);

    onClicks('showHistoryChat', { indexChatOrChat, backFunction, friends, search });
}