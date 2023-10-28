function random(x, y)
{
    return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
}


function pick(array)
{
    return array[random(array.length - 1)]
}


function noSpecialCharacters (text) {
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
        var i = 0;
        var returns = [];

        while(i < Args.idsOrSreensNames.length) {
            var info = Args.idsOrSreensNames[i];

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

    const response = await VKAPI.call('execute', { code, idsOrSreensNames });


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
    chats: false,
    addChats: false
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

        return onClicks('searchChats', {offset});
    }

    const [creators, friends] = await Promise.all([
        getUsersOrGroupsFromVK(
            foundChats.chats.map(chat => chat.creator),
            true
        ),
        getFriends()
    ]);


    const listChatsHTML = foundChats.chats.map(chat => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, friends, creator: creators.find(creator => creator.id === Math.abs(chat.creator)) });
    }).join('<br style="display: block; margin: 5px; content: \'\';">');

    modalPage.setContent(listChatsHTML)
        .setTitle(
            title(
                foundChats.found,
                blankFiltersSearchChats({ offset, user, foundChats: foundChats.found, countListChats: foundChats.chats.length })
            )
        );

    onClicks('searchChats', {offset, friends});

    load.chats = false;
}


async function authModalPage() {
    const html = `
            <div class="ProfileModalInfoHeadline" style="padding: 10px;">
                <span style="display: block; gap: 5px; text-align: center; font-size: 13px;">
                    Расширение «ПоискЧата» — это инструмент, разработанный для удобного поиска чатов в социальной сети ВКонтакте. Оно предоставляет возможность пользователям быстро найти нужный чат, используя различные фильтры и параметры.
                    <br/>В настоящее время расширение находится на стадии активной разработки, поэтому мы регулярно выпускаем обновления, внедряем новые функции и исправляем ошибки. Чтобы быть в курсе всех последних обновлений, рекомендуем подписаться на наш <a style="color: #71aaeb;" target="_blank" href="${services.telegramChannelURL}">телеграм-канале</a>, где мы делимся информацией о новых возможностях расширения.
                    <br/>С помощью расширения Вы можете осуществлять поиск чатов по их названиям, что позволяет быстро найти нужную беседу. Кроме того, Вы можете использовать различные фильтры для уточнения результатов поиска. Например, Вы можете фильтровать чаты по участникам, чтобы найти только те, в которых участвует определенный пользователь или группа людей. Также есть возможность фильтровать чаты по Вашим друзьям, чтобы быстро найти те беседы, в которых они присутствуют.
                    <br/>
                    
                    <hr style="margin-top: 30px"  class="separator" data-content="Получение Вашего токена"/>
                    <span style="color: ${appearance.get() === 'dark' ? '#f6c254' : '#df9700'};">
                        Для использования расширения необходима авторизация, которая будет выполняться путем получения Вашего токена ВКонтакте с помощью приложения «<a style="color: #71aaeb;" target="_blank" href="${services.auth.urlByGetCode}">ПоискЧата</a>».
                    </span>
          
                    <hr style="margin-top: 25px;" class="separator" data-content="Обратите внимание"/>
                    <span> 
                        Ваш токен будет сохранен только на Вашем компьютере (локально) и будет действителен только в течение 24 часов. По истечении этого времени будет получен новый токен, чтобы гарантировать его актуальность во время использования расширения. Таким образом, фактическое хранение токена на сервере невозможно. 
                    </span>
                    
                    <hr style="margin-top: 25px" class="separator" data-content="Авторизация"/>
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

    modalPage.new(titleModalPage({before: 'Авторизация'})).setContent(html).visible();


    const buttonAuthForModalPage = document.getElementById('button_auth_for_modal_page');
    buttonAuthForModalPage.onclick = async () => {
        let info = 'Регистрация учетной записи в расширении ПоискЧата..</br>';

        modalPage.setLoad([info]);
        const isValid = await vkAuth();

        if (!isValid) {
            return modalPage.setLoad([info + 'Неизвестная ошибка, попробуйте еще раз']);
        }

        modalPage.setLoad([info + 'Авторизованный, VK токен получен.</br>Перезагружаю вкладку для начала работы расширения']);
        setTimeout(() => location.reload(), 1_000);
    };

    GM_setValue('timeStampAuthModalPage', services.timeStampAuthModalPage = Infinity);
}


async function showUsersChat(indexChat, friends, backFunction, offset = 0, search) {
    const chat = currentChats.foundChats.chats[indexChat];
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
            ${blankInputSearch({ id: 'search_users_chat', value: search})}
            ${subTitle || blankPages({})}
        `
    });

    modalPage.new(title()).setLoad(services.pick.showUsersChat).visible();

    let membersList = await getUsersOrGroupsFromVK(chat.members, true);
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
        return onClicks('showUsersChat', { indexChat, friends, backFunction, offset });
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
                    ${blankPages({found: membersCount, inOnePage: sortedMembersList.length, offset, currentPage, totalPage})}
                    <span style="display: flex; gap: 5px;">
                        ${icons({name: 'users_outline', size: 16, realSize: 20, fill: 'secondary'})}
                        <span style="padding-right: 10px; color: #99a2ad;">
                            ${onlineMembers.toLocaleString('ru-RU')} ${decOfNum(onlineMembers, ['участник', 'участника', 'участников'])} в сети
                        </span>
                    </span>
                `
            )
        );

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
    iconsAccent: appearance.get() === 'dark'
        ? 'brightness(0) saturate(100%) invert(59%) sepia(9%) saturate(3344%) hue-rotate(175deg) brightness(75%) contrast(92%);'
        : 'brightness(0) saturate(100%) invert(78%) sepia(22%) saturate(6954%) hue-rotate(184deg) brightness(100%) contrast(84%);',
    original: ''
}
function icons({ name, realSize = 24, size = realSize, fill = 'accent' }) {
    fill = iconColors[fill] ? `style="filter: ${iconColors[fill]}"` : '';

    return `
        <svg 
            fill="currentColor" 
            stroke="currentColor"
            width="${size}" 
            height="${size}"
            ${fill}
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
    modalPage.new(titleModalPage({before: 'Статистика хранилища и топы'}))
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
    modalPage.new(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            <a id="back_button_modal_page" class="btn" style="border-radius: 10px;"> 
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })} Назад 
            </a> 
            ${icons({ name: 'users_outline', realSize: 20, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Топ пользователей по чатам
            </span>
        </div>
    `).setLoad().visible();

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
    modalPage.new(`
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;">
            <a id="back_button_modal_page" class="btn" style="border-radius: 10px;"> 
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })} Назад 
            </a> 
            ${icons({ name: 'users_3_outline', realSize: 24, size: 28 })}
            <span style="font-size: 18px; display: flex; font-weight: 500;"> 
                Топ групп по чатам
            </span>
        </div>
    `).setLoad().visible();

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

    modalPage.new(titleModalPage({before: 'Добавление чата'})).setContent(html).visible();

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


async function showTopUseExtension () {
    modalPage.new(titleModalPage({
        title: 'Админ панель',
        before: 'Использования',
        icon: `
            <span class="btn" id="back_button_modal_page" style="padding: 0px; border-radius: 4px;">
                ${icons({ name: 'browser_back', size: 20, fill: 'secondary' })}
            </span>
        `
    })).setLoad().visible();

    
    (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
        showAdminPanel({ isCurrent: true });
    };

    const users = await SCAPI.call({method: "extension.getTopUse"});

    const usersFromVK = await getUsersOrGroupsFromVK(users.map(user => user.id), true);

    let htmlUsers = usersFromVK.map((member, index) => {
        const user = users[index];
        const subTitle = user.useExtension ? `${user.useExtension.toLocaleString('ru-RU')} ${decOfNum(user.useExtension, ['запрос', 'запроса', 'запросов'])} к API` : '0 запросов к API';

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


async function showAdminPanel () {
    modalPage.new(titleModalPage({
        title: 'Админ панель',
        icon: icons({ name: 'wrench_outline', fill: 'iconsAccent', realSize: 28 , size: 28 })
    })).setLoad().visible();

    const html = `
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
            <div style="display: flex; flex-direction: row; align-items: center;">
            
                 <span id="top_use_extension" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Топ пользователей по чатам"> 
                    ${icons({ name: 'api_outline', realSize: 20, size: 48 })} 
                    <span class="button" style="font-size: 12px;">Использования</span>
                </span>

            </div>
        </div>
    `;

    modalPage.setContent(html);

    document.getElementById('top_use_extension').onclick = () => {
        showTopUseExtension();
    }
}


async function showShop () {
    modalPage.new(titleModalPage({
        before: 'Товары',
    })).setLoad().visible();

    const html = `
        <div style="display: flex; align-items: center; flex-direction: column; margin: 10px;">
        
            <div style="display: flex; flex-direction: row; align-items: center;">

                <span id="subscription" class="group-stats vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard" title="Описание товара"> 
                    ${icons({ name: 'star_circle', realSize: 16, size: 45 })}
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
                    <p style="margin-bottom: 15px;"></p>
                    <span style="display: flex; flex-direction: row; align-items: center; gap: 5px;">
                        ${icons({name: 'donut_circle_fill_yellow', size: 20, realSize: 20, fill: 'original'})}
                        Ваша подписка активна до ${moment(services.profileFromSC.subscription.expired).calendar()}
                    </span>
                ` 
                : ''
            }

        </div>
    `;

    modalPage.setContent(html);

    onClicks('showShop', {})
}


const descriptionProduct = {
    'subscription': {
        title: 'Подписка',
        tableСontents: 'Больше возможностей с подпиской',
        price: 250,
        description: `
            Доступ к чатам любого пользователя или группы ВКонтакте.
            <br/>
            Мы сделали подписку платной, поскольку функции с подпиской требуют дополнительных расходов, в том числе на аренду серверов. Вклад подписчиков позволяет нам покрывать эти расходы и помогает «ПоискЧата» оставаться бесплатным для всех пользователей.
        `,
    },
    'myHide': {
        title: 'Скрыть все свои чаты',
        tableСontents: 'Гарантированная конфиденциальность',
        price: 500,
        description: `
        Мы понимаем, что многим пользователям не нравится, когда кто-то несанкционированно заходит в их любимые чаты. Это может серьезно нарушить комфорт и безопасность пользователей, особенно если чат является школьным или городским. Кроме того, информация, представленная в профиле чата, может раскрыть много о человеке, его интересах, месте жительства, образовании и месте работы.
        Мы предлагаем функцию скрытия чатов, чтобы Вы могли защитить свою приватность. Это позволит Вам контролировать доступ к Вашим чатам и предотвратить несанкционированный доступ.
        Скрытие чатов - это важная функция, которая помогает защитить Вас от нежелательного вмешательства и сохранить Вашу приватность.
        Ваши чаты останутся полностью скрыты от посторонних глаз.
        <br/>
        Ни один сервис, который использует наше API, такие как
        <a href="https://t.me/HowToFind" target="_blank" > HowToFind</a>,
        <a href="https://vk.com/luxury__cb" target="_blank" > luxury</a>,
        <a href="https://vk.com/lapik_bot" target="_blank" > lapik bot</a> и
        <a href="https://t.me/QuickLeaks_Bot" target="_blank" > Quick OSINT</a>
        не сможет получить доступ к Вашим чатам, включая и это расширение.
        `,
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
            <span style="font-size: 15px; font-weight: 500;">${product.tableСontents}</span>
            <p style="margin-bottom: 15px;"></p>
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
