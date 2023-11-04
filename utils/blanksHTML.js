const logo = `
    <svg width="28" height="28" class="vkuiIcon vkuiIcon--28 vkuiIcon--w-28 vkuiIcon--h-28" display="block" style="border-radius: 50%">
        <image width="28" height="28" xlink:href="https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/icons/logo.png"/>
    </svg>
`;

function titleModalPage({
    title = 'ПоискЧата',
    before = '',
    after = '',
    subTitle = '',
    icon = logo
}) {
    if (typeof before === 'object') {
        before = `
            <div style="display: flex; align-items: center; flex-direction: row; gap: 10px;">
                ${before.title ? `<span style="font-weight: 400; color: #828282; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"> > ${before.title} </span>` : ''}
                ${before.icon ?
                `
                        <div style="width: 20px; height: 20px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                            <img class="vkuiImageBase__img" src="${before.icon}">
                        </div>
                    ` : ''
            }
            </div>
        `
    } else if (before) {
        before = `<span style="font-weight: 400; color: #828282; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"> > ${before} </span>`
    }

    return `
        <div>
            <div style="display: flex; justify-content: space-between; flex-direction: row;">
                <span style="display: flex; flex-direction: row; align-items: center; gap: 10px; line-height: 49px;"> 
                    ${icon}
                    <span style="font-size: 20px; display: flex; font-weight: bold; gap: 5px ;flex-direction: row;">
                        ${title}
                        ${before}
                    </span>
                </span>
                ${after ? `<span style="color: #828282; font-weight: 400; display: flex; align-items: center; justify-content: flex-end; line-height: 49px;">${after}</span>` : ''}
            </div>
            <div style="font-size: 13px; padding: 5px;">
                ${subTitle ? subTitle : ''}
            </div>
        </div>
    `
}


function blankSeparator(style) {
    return `<div ${style ? `style="${style}"` : ''} class="vkuiSeparator vkuiSeparator--padded ProfileGroupSeparator"><hr class="vkuiSeparator__in"></div>`;
}


function blankChat({ chat, creator, friends }) {
    const typeMention = creator?.first_name ? 'id' : 'club';

    const creatorUrl = `https://vk.com/${typeMention}${creator.id}`;
    const nameHTML = typeMention === 'id'
        ? `<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.first_name)} ${deXSS(creator.last_name)}</span>`
        : `Группа «<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.name)}</span>»`;

    const nameString = deXSS(typeMention === 'id'
        ? `${creator.first_name} ${creator.last_name}`
        : `Группа «${creator.name}»`
    );

    const photo = chat.photo
        ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
        : 'https://vk.com/images/community_200.png';

    chat.title = deXSS(chat.title);

    const infoFriends = friends.filter(friend => chat.members.includes(friend.id))
        .map(friend => { 
            return { 
                photo: friend.photo_100, 
                name: `${friend.first_name} ${friend.last_name}`,
                id: friend.id,
            }
        });
    const countFriendsInChat = infoFriends.length;
    infoFriends.splice(3);

    return `
        <div class="${classGroup}" style="padding-bottom: 0px;">
            <section style="font-weight: 500;">
                
                <div class="ProfileModalInfoHeadline" style="padding: 0px 0px 5px 0px;">
                       
                    <div class="background-image-chat" style="
                        background-image: linear-gradient( 
                            ${appearance.get() === 'dark'
                                ? 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)'
                                : 'rgba(255, 255, 255, .8), rgba(255, 255, 255, .8)'
                            }), 
                            url(${photo});
                    ">      
                    </div>
            
                    <div id="raw" style="align-items: center; margin-bottom: 5px; position: relative; gap: 15px; z-index: 3; justify-content: space-between;">

                        <div id="raw" style="margin-bottom: 10px; gap: 15px;">
                            <a title="Скопировать ссылку на чат" style="width: 58px; height: 58px;">
                                <div style="width: 58px; height: 58px; box-shadow: 0 0 0 0.1em;" link="vk.me/join/${chat.key}"
                                    class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded copy_link_for_chat" role="img">
                                    <img class="vkuiImageBase__img" src="${photo}">
                                </div>
                            </a>

                            <div>
                                <h4 title="${chat.title}" class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1" style="font-size: 15px; max-width: 230px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                    ${chat.membersCount > 7_000
                                        ? `<span style="display: flex; flex-direction: row; gap: 5px; align-items: center; font-size: 12px; color: #99a2ad;"> 
                                                ${icons({ name: 'archive_outline', size: 16, fill: 'secondary' })} Канал
                                            </span>`
                                        : ''
                                    }                                    
                                    ${chat.title}
                                </h4>

                                ${countFriendsInChat ? `
                                        <div style="display: flex; justify-content: flex-start; gap: 3px; align-items: center;">
                                            <div class="UsersStack-module__root--HKcQf UsersStack-module__sizeS--O9MMO UsersStack-module__directionRow--HjNuZ ProfileFullStacks__stacks">
                                                <div class="UsersStack-module__photos--bCsMG" aria-hidden="true">
                                                    ${blankUsersStack(infoFriends)}
                                                </div>
                                            </div>
                                            <span style="color: #99a2ad; font-weight: 400;">
                                                ${countFriendsInChat.toLocaleString('ru-RU')} ${decOfNum(countFriendsInChat, ['друг', 'друга', 'друзей'])} в чате
                                            </span>
                                        </div>`
                                    : ''
                                }
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: center; margin-bottom: 10px; margin-right: 10px;">
                            <span class="btn-chat members_chat">
                                ${chat.membersCount.toLocaleString('ru-RU')} ${decOfNum(chat.membersCount, ['участник', 'участника', 'участников'])}
                            </span>
                            ${icons({ name: 'users_2_outline', realSize: 16, size: 16, fill: 'secondary' })}
                        </div>
                    </div>
                    
                    
                    ${blankSeparator('margin-top: 5px; margin-bottom: 10px;')}

                    
                    <div style="gap: 5px; display: flex; align-items: center; justify-content: space-between;">

                        <div style="display: flex; flex-direction: column;">
    
                            <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">
                                <span>
                                    ${icons({ name: 'crown_outline', size: 16, fill: 'secondary' })}
                                </span>
    
                                <a title="${nameString}" target="_blank" href="${creatorUrl}" style="display: flex;">
                                    ${nameHTML}
                                </a>
    
                                <div style="width: 16px; height: 16px;" 
                                    class="vkuiAvatar vkuiImageBase vkuiImageBase--size-16 vkuiImageBase--loaded" role="img">
                                    <img class="vkuiImageBase__img" src="${creator.photo_100 || ''}">
                                </div>
                            </div>
    
                                
                            <span style="color: #99a2ad; display: flex; align-items: center; flex-direction: row; gap: 5px">
                                ${icons({ name: 'add', size: 16, fill: 'secondary' })}
                                <p style="max-width: 185px; margin: 0px;">Добавлен ${moment(chat.added).fromNow()}</p>
                            </span>
    
                        </div>

                        
                        <div style="display: flex; align-items: flex-end; flex-direction: column;">
                            <a target="_blank"
                                style="padding: 2px; text-decoration: none;"
                                    href="https://vk.me/join/${chat.key}"
                                        class="btn ${classGroup}" 
                            >
                                ${icons({ name: 'door_enter_arrow_right_outline', realSize: 16, size: 16, fill: 'secondary' })}
                                <span style="font-size: 13px; font-weight: 500; color: #99a2ad; padding: 0px 4px 0px 4px;">
                                    Присоединиться
                                </span>
                            </a>

                            <span style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center; text-align: end;">
                                <p style="max-width: 185px; margin: 0px;">
                                    Обновлен ${moment(chat.lastUpdate).fromNow()}
                                 </p>
                                ${icons({ name: 'replay', size: 16, fill: 'secondary' })}
                            </span>
                        <div>
                    </div>
                </div>
            </section>
        </div>
    `;
}


function blankMembersList({ member, creator, friends, subTitle }) {
    const typeMention = member?.first_name ? 'id' : 'club';
    const link = `https://vk.com/${typeMention}${member.id}`;
    const memberName = deXSS(typeMention === 'id'
        ? `${member.first_name} ${member.last_name}`
        : `Группа «${member.name}»`
    );

    const isFriend = friends.filter(friend => member.id === friend.id).length !== 0;


    return `
        <li class="ListItem ListItem--can-be-hovered" style="padding-left: 10px">
            <div class="ListItem__main">
                <div class="Entity">
                    <div class="Entity__aside vkuiAvatar vkuiImageBase vkuiImageBase--size-48 vkuiImageBase--loaded">
                        <img class="vkuiImageBase__img" target="_blank" src="${member?.photo_100 || ''}" />
                    </div>

                    <div class="Entity__main">
                        <div class="Entity__title" style="display: flex; flex-direction: row; align-items: center;">
                            <a target="_blank" href="${link}" ${isFriend ? `style="color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};"` : ''}>
                                <span style="font-weight: bold;">${memberName}</span>
                            </a>
                            ${Math.abs(creator) === member.id
            ? `    
                                        <span style="color: #828282; padding-left: 5px;">
                                            ${icons({ name: 'crown_outline', size: 20, fill: 'secondary' })}
                                        </span>
                                      `
            : ''
        }
                        </div>
                        <div class="Entity__description">
                            <span style="color: #828282;">
                                ${subTitle ? subTitle :
            `
                                            ${member?.online ? 'В сети' : member?.last_seen ? `${member.sex === 2 ? 'Был ' : 'Была '}` + moment(member.last_seen.time * 1_000).fromNow() : ''}
                                            ${typeMention === 'club' ? 'Бот' : ''}
                                        `
        }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `;
}


function blankMembersTopList({ member, memberFromVK, index }) {
    const typeMention = memberFromVK?.first_name ? 'id' : 'club';
    const link = `https://vk.com/${typeMention}${memberFromVK.id}`;
    const memberName = deXSS(typeMention === 'id'
        ? `${memberFromVK.first_name} ${memberFromVK.last_name}`
        : `${memberFromVK.name}`
    );


    return `
        <li class="ListItem ListItem--can-be-hovered" style="padding-left: 10px">
            <div class="ListItem__main" style="display: flex; flex-direction: row; align-items: center; gap: 12px">
                <span style="
                    display: flex;
                    background-color: var(--vkui--color_background_secondary);
                    border-radius: 10px;
                    font-weight: bold;
                    color: var(--vkui--color_text_subhead);
                    padding: 5px;
                    max-height: 10px;
                    align-items: center;
                    cursor: default;
                ">
                    # ${index + 1}
                </span>
                <div class="Entity">
                    <div class="Entity__aside vkuiAvatar vkuiImageBase vkuiImageBase--size-48 vkuiImageBase--loaded">
                        <img class="vkuiImageBase__img" target="_blank" src="${memberFromVK?.photo_100 || ''}" />
                    </div>

                    <div class="Entity__main">
                        <div class="Entity__title" style="display: flex; flex-direction: row; align-items: center;">
                            <a target="_blank" href="${link}">
                                <span style="font-weight: bold;">${memberName}</span>
                            </a>
                        </div>
                        
                        <div class="Entity__description">
                            ${member.count.toLocaleString('ru-RU')} ${decOfNum(member.count, ['чат', 'чата', 'чатов'])}
                        </div>
                        
                    </div>
                </div>
            </div>
        </li>
    `;
}


function blankNotFound(icon, text, button) {
    return `
        <div style="height: 280px; display: flex; justify-content: center">
            <div style="display: flex; align-items: center; flex-direction: column; justify-content: center;">
                ${icon}
                <span style="font-size: 13px; padding-top: 3px; text-align: center; max-width: 250px;">
                    ${text}
                </span>
                ${button ?
            `
                        <div style="padding-top: 15px;">
                            <button id="${button.id}" class="FlatButton FlatButton--primary FlatButton--size-m" type="button">
                                <span class="FlatButton__in">
                                    <span class="FlatButton__content">${button.text}</span>
                                </span>
                            </button>
                        </div>
                    `
            : ''
        }
            </div>
        <div>
    `
}


function blankInputSearch({ id = 'search', value = '', placeholder = 'Поиск' }) {
    return `
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 3px">
            <input
                style="width: 100%; font-size: 13px;"
                class="input-text"
                type="text"
                id="${id}"
                placeholder="${placeholder}"
                autoComplete="off"
                value="${value}"
                maxLength="100"
            >
                <button title="Поиск" id="searchChats_button" class="input-button">
                    ${icons({ name: 'search_stars_outline', size: 20, realSize: 24 })}
                </button>
        </div>
    `
}


function blankPages({ found = undefined, totalPage = 0, currentPage = 0, offset = 0, inOnePage = undefined }) {
    return `
        <div style="display: flex; color: #99a2ad; align-items: center; height: 20px;"> 
            <span style="display: flex; gap: 5px;">
                ${icons({ name: 'document_text_outline', size: 16, realSize: 20, fill: 'secondary' })}
                <span style="padding-right: 10px; color: #99a2ad;">
                    Страница ${found !== undefined && found !== 0 ? `${currentPage}/${totalPage}` : found === 0 ? 'пуста' : 'загружается'}
                    ${inOnePage ? ` (${inOnePage.toLocaleString('ru-RU')})` : ''}
                </span>
            </span>
                    
            ${found ?
            `
                    <span style="display: flex; gap: 5px;">
                        ${offset > 0 ?
                `
                                <a id="previous_page_button" style="${!(currentPage < totalPage) ? 'padding-right: 15px;' : ''}"> 
                                    Назад
                                </a>
                            `
                : ''
            }
                        ${currentPage < totalPage && offset > 0 ? '<span style="padding-left: 2px; padding-right: 2px; ">•</span>' : ''}
                        ${currentPage < totalPage ?
                `
                                <a id="next_page_button" style="padding-right: 15px;">
                                    Далее
                                </a>
                            `
                : ''
            }
                    </span>
                `
            : ''
        }
        </div>
    `
}


function blankFiltersSearchChats({
    user = false,
    foundChats,
    offset,
    countListChats = 0
}) {
    let typeMention;
    let userUrl;

    let nameHTML;
    let nameString;

    if (user) {
        typeMention = user?.first_name ? 'id' : 'club';
        userUrl = `https://vk.com/${typeMention}${user.id}`;

        nameHTML = typeMention === 'id'
            ? `<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(user.first_name)} ${deXSS(user.last_name)}</span>`
            : `группа «<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(user.name)}</span>»`;

        nameString = deXSS(typeMention === 'id'
            ? `${user.first_name} ${user.last_name}`
            : `Группа «${user.name}»`
        );
    }

    const currentPage = offset / 15 !== 0 ? offset / 15 + 1 : 1;
    const totalPage = Math.ceil(foundChats / 15 || 1);


    return `

    <div style="font-size: 13px; padding: 5px;">
        
        ${blankInputSearch({ id: 'searchChats_input', value: filters.title, placeholder: 'Найдётся все, ну.. почти' })}

        <div style="gap: 5px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                <span>
                    ${icons({ name: 'sort', size: 16, realSize: 24, fill: 'secondary' })}
                </span>
                <label for="sortField"> Сортировать по </label>
                <select name="sort_field" id="sort_field" class="sort-select">
                    <option value="membersCount" ${filters.sortField === 'membersCount' ? 'selected' : ''}>количеству участников</option>
                    <option value="added" ${filters.sortField === 'added' ? 'selected' : ''}>дате добавления</option>
                    <option value="lastUpdate" ${filters.sortField === 'lastUpdate' ? 'selected' : ''}>дате обновления</option>
                </select>
                <span class="btn" style="border-radius: 3px;" id="filter_set_sort_order" title="${filters.sortOrder === 'desc' ? 'по возрастанию' : 'по убыванию'}">
                    ${icons({ name: filters.sortOrder === 'desc' ? 'arrow_down_outline' : 'arrow_up_outline', size: 16, fill: 'secondary' })}
                </span>
            </div>
        </div>

        ${user ?
            `
                <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                    <span>
                        ${icons({ name: 'user_outline', size: 16, fill: 'secondary' })}
                    </span>
                    Чаты, в которых есть
                    <a title="${nameString}" target="_blank" href="${userUrl}" style="display: flex;">
                        ${nameHTML}
                    </a>

                    <div style="width: 16px; height: 16px;" 
                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-16 vkuiImageBase--loaded" role="img">
                        <img class="vkuiImageBase__img" src="${user.photo_100 || ''}">
                    </div>

                    <span class="btn" style="border-radius: 3px;" title="Удалить" id="filter_button_delete_user">
                        ${icons({ name: 'cross_large_outline', size: 16, realSize: 28, fill: 'secondary' })}
                    </span>
                </div>
            ` : ``
        }


        <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
            <span>
                ${icons({ name: 'users_3_outline', size: 16, realSize: 20, fill: 'secondary' })}
            </span>
            Чаты, в которых есть <a target="_blank" href="https://vk.com/friends">Ваши друзья</a>
            <input type="checkbox" id="filter_only_with_friends" ${filters.onlyWithFriends ? 'checked' : ''} />
        </div>
        
        
        <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
            <span>
                ${icons({ name: 'poll_outline', size: 16, realSize: 32, fill: 'secondary' })}
            </span>
            <label style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;" id="range_users_label" for="range_users_label">
                Диапазон участников от 
                <input class="sort-select" type="number" 
                    id="range_users_input_min" 
                    name="range_users" 
                    min="0" 
                    max="199998" 
                    value="${filters.minUsers}" 
                    style="width: ${((filters.minUsers.toString().length + 1) * 8) - 8}px; margin: 0px;"
                />
                до 
                <input class="sort-select" type="number" 
                    id="range_users_input_max" 
                    name="range_users" 
                    min="1" 
                    max="200000"
                    value="${filters.maxUsers}" 
                    style="width: ${((filters.maxUsers.toString().length + 1) * 8) - 8}px; margin: 0px;"
                /> 
            </label>
            <a id="clear_range_users">Сбросить</a>
        </div>


        ${blankPages({ found: foundChats, inOnePage: countListChats, offset, currentPage, totalPage })}
    </div>
    `
}


function blankUsersStack(arrayInfoFriends) {
    return arrayInfoFriends.map((friend, index) => {
        return `<svg xmlns="http://www.w3.org/2000/svg" className="UsersStack-module__photo--iCBco" aria-hidden="true" style="width: 24px; height: 24px">
        <a href="https://vk.com/id${friend.id}" target="_blank">
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
            <image href="${friend.photo}" width="24" height="24"/>
            <use href="#:r0:${index}" fill="none" className="SVGStackMask-module__useElement--usICi"/>
        </g>
        <title>${friend.name}</title>
        </a>
    </svg>`

    }).join('');
}