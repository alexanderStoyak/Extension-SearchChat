const logo = icons({ name: 'logo', size: 28, fill: 'original' });

const fontFamilyVK = `var(--palette-vk-font,-apple-system,BlinkMacSystemFont,'Roboto','Helvetica Neue',Geneva,"Noto Sans Armenian","Noto Sans Bengali","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Hebrew","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Osmanya","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thai",arial,Tahoma,verdana,sans-serif)`;

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
                ${/^http(s)?:/.test(before.icon) ?
                `
                        <div style="width: 20px; height: 20px;" class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                            <img class="vkuiImageBase__img" src="${before.icon}">
                        </div>
                    ` : before.icon ? before.icon : ''
            }
            </div>
        `
    } else if (before) {
        before = `<span style="font-weight: 400; color: #828282; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"> > ${before} </span>`
    }

    return `
        <div>
            <div style="display: flex; justify-content: space-between; flex-direction: row; line-height: 49px;">
                <span style="display: flex; flex-direction: row; align-items: center; gap: 10px;"> 
                    ${icon}
                    <span style="font-size: 20px; display: flex; font-weight: bold; gap: 5px ;flex-direction: row;">
                        ${title}
                        ${before}
                    </span>
                </span>
                ${after ? `<span style="color: #828282; font-weight: 400; display: flex; align-items: center; justify-content: flex-end;">${after}</span>` : ''}
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


function blankChat({ chat, creator, friends, isGroupClass = true }) {
    const typeMention = creator?.first_name ? 'id' : 'club';

    const nameHTML = typeMention === 'id'
        ? `<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.first_name)} ${deXSS(creator.last_name)}</span>`
        : `Группа «<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.name)}</span>»`;

    const photo = chat.photo
        ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
        : 'https://vk.com/images/community_200.png';

    chat.title = deXSS(chat.title);
    const chatTitleForHTMLTitle = `Названия чата\n\nСейчас: ${chat.title}${chat.history?.titles?.length ? `\n\nБыли:\n⠀${chat.history.titles.map(x=>x).reverse().map(({title}) => deXSS(title)).join('\n⠀⠀')}` : ''}`

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

    const infoOnline = {
        description: 'Недавно добавленный',
        hint: 'Скоро мы определим статус его активности.',
        colorIcon: '#b5a23c'
    };

    const areChangesHistoey = chat.history?.photos?.length || 
        chat.history?.titles?.length || 
        chat.history?.newUsers?.length || 
        chat.history?.exitedUsers?.length;
    
    if (Date.now() - +new Date(chat.added) >= 24 * 3 * 60 * 60 * 1_000) {
        infoOnline.description = 'Неактивный';
        infoOnline.hint = 'В течени последних 7 дней в чате не происходили какие либо изменения.';
        infoOnline.colorIcon = '#b53c3c';
    };

    if (new Date(chat.lastUpdateHistory) > new Date(Date.now() - 24 * 7 * 60 * 60 * 1_000)) {
        infoOnline.description = 'Активный';
        infoOnline.hint = 'В течение последних 7 дней в чате произошли входы/выходы участников или была обновлена фотография или название чата';
        infoOnline.colorIcon = '#3aa744';
    };

    const tags = chat.tags.map(tag =>
        `<span class="btn filter_tags ${tag}" style="display: flex; font-weight: 400; ${filters.tags.findIndex(_tag => _tag === tag) !== -1 ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''} align-items: center;">${deXSS(tag)}</span>`
    ).join('');

    return `
        <div ${isGroupClass ? `class="${classGroup}"` : ''} style="padding-bottom: 0px;">
            <section style="font-weight: 500;">
                
                <div class="ProfileModalInfoHeadline" style="padding: 0px 0px 5px 0px;">

                    ${chat.membersCount < 7_010 ? 
                        `
                            <div style="display: flex; justify-content: space-between; padding-bottom: 10px;">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="display: flex; color: #99a2ad; font-weight: 500; flex-direction: row; align-items: center; gap: 5px; padding: 2px;">
                                        <span style="display: flex; font-weight: 500; flex-direction: row; align-items: center; gap: 5px;" onmouseover="showTitle(this, '${areChangesHistoey ? `Последние изменения истории этого чата было ${moment(chat.lastUpdateHistory).fromNow().toLowerCase()}` : 'Изменений в истории этого чата еще не было.'}')">
                                            ${icons({ name: 'new', size: 16, fill: infoOnline.colorIcon })}
                                            ${infoOnline.description}
                                        </span>
                                        ${infoOnline.hint ? blankHint(infoOnline.hint) : ''}
                                    </span>
                                </div>

                                ${tags
                                    ? `
                                        <div style="display: flex; gap: 5px;">
                                            <span style="display: flex; justify-content: flex-end; word-break: break-all; flex-wrap: wrap; text-align: center; gap: 6px;">
                                                ${tags}
                                            </span>
                                            ${icons({ name: 'hashtag_outline', size: 16 })}
                                        </div>
                                    `
                                    : ''
                                }

                            </div>
                        ` 
                        : ''
                    }
                       
                    <div class="background-image-chat" style="
                        background-image: linear-gradient( 
                            ${appearance.get() === 'dark'
                                ? 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)'
                                : 'rgba(255, 255, 255, .7), rgba(255, 255, 255, .7)'
                            }), 
                            url(${photo});
                    ">      
                    </div>
            
                    <div id="raw" style="align-items: center; margin-bottom: 5px; position: relative; gap: 15px; z-index: 3; justify-content: space-between;">

                        <div id="raw" style="margin-bottom: 10px; gap: 15px;">
                            <div style="width: 58px; height: 58px;">
                                <div style="width: 58px; height: 58px; box-shadow: 0 0 0 0.1em;"
                                    class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded" role="img">
                                    <img class="vkuiImageBase__img" src="${photo}">
                                </div>
                            </div>

                            <div>
                                <h4 title="${chatTitleForHTMLTitle}" class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1" style="font-size: 15px; max-width: 230px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                    ${chat.membersCount > 1 && !chat.members.length
                                        ? `<span style="display: flex; flex-direction: row; gap: 5px; align-items: center; font-size: 12px; color: #99a2ad;"> 
                                                ${icons({ name: 'archive_outline', size: 16 })} Канал
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
                                        </div>
                                    `
                                    : ''
                                }
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; flex-direction: column; margin-bottom: 10px; margin-right: 10px;">
                            <div class="members_chat btn-chat-users-show" onmouseover="showTitle(this, 'Открыть')"  style="display: flex; flex-direction: row; gap: 5px; align-items: center;">
                                <span>
                                    ${chat.membersCount.toLocaleString('ru-RU')} ${decOfNum(chat.membersCount, ['участник', 'участника', 'участников'])}
                                </span>
                                ${icons({ name: 'users_2_outline', size: 16, fill: appearance.get() === 'dark' ? '#949da7' : '#99a2b1' })}
                            </div>

                            <div style="display: flex; align-items: flex-end; flex-direction: row; gap: 10px;">
                                ${chat.history?.newUsers?.length ? `
                                    <span onmouseover="showTitle(this, 'Входов в чат')" style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center; text-align: end;">
                                        <p style="max-width: 173px; margin: 0px; color: ${appearance.get() === 'dark' ? "#428d49" : '#7db582'};">
                                            ${chat.history.newUsers.length.toLocaleString()}
                                        </p>
                                        ${icons({ name: 'user_add_outline', size: 18, fill: appearance.get() === 'dark' ? '#949da7' : '#99a2b1' })}
                                    </span>
                                ` : ''}

                                ${chat.history?.exitedUsers?.length ? `
                                    <span onmouseover="showTitle(this, 'Выходов из чата')" style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center; text-align: end;">
                                        <p style="max-width: 173px; margin: 0px; color: ${appearance.get() === 'dark' ? "#8b3e3e" : '#d7a0a0'};">
                                            ${chat.history.exitedUsers.length.toLocaleString()}
                                        </p>
                                        ${icons({ name: 'user_minus_outline', size: 18, fill: appearance.get() === 'dark' ? '#949da7' : '#99a2b1' })}
                                    </span>`
                                : ''}
                            </div>
                        </div>
                    </div>
                    

                    <div style="gap: 5px; display: flex; align-items: center; justify-content: space-between;">

                        <div style="display: flex; flex-direction: column;">
    
                            <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">
                                <span>
                                    ${icons({ name: 'crown_outline', size: 16 })}
                                </span>

                                ${blankMention({
                                    id: creator.id,
                                    type: typeMention,
                                    text: nameHTML
                                })}
    
                                <div style="width: 18px; height: 18px;" 
                                    class="vkuiAvatar vkuiImageBase vkuiImageBase--size-18 vkuiImageBase--loaded" role="img">
                                    <img class="vkuiImageBase__img" src="${creator.photo_100 || ''}">
                                </div>
                            </div>
    
                                
                            <span style="color: #99a2ad; display: flex; align-items: center; flex-direction: row; gap: 5px">
                                ${icons({ name: 'add', size: 16 })}
                                <p style="max-width: 173px; margin: 0px;">Добавлен ${moment(chat.added).fromNow().toLowerCase()}</p>
                            </span>
    
                        </div>

                        
                        <div style="display: flex; align-items: flex-end; flex-direction: column;">
                            <span style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center; text-align: end;">
                                <p style="max-width: 173px; margin: 0px;">
                                    Обновлен ${moment(chat.lastUpdate).fromNow().toLowerCase()}
                                 </p>
                                ${icons({ name: 'switch', size: 12 })}
                            </span>

                            ${chat.views ? 
                                `
                                    <span onmouseover="showTitle(this, 'Просмотры')" style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center; text-align: end;">
                                        <span style="max-width: 173px; margin: 0px;">
                                            ${chat.views.toLocaleString('ru-RU')}
                                        </span>
                                        ${icons({ name: 'view', size: 14, fill: '#99a2ad' })}
                                    </span>
                                ` 
                                : ''
                            }
                        </div>
                    </div>

                    ${blankSeparator('margin-top: 5px; margin-bottom: 10px;')}

                    <div style="gap: 15px; display: flex; align-items: center; justify-content: space-between; padding: 0px 0px 5px 0px;">
                        <a style="padding: 2px; padding-left: 4px; text-decoration: none;" 
                            link="vk.me/join/${chat.key}"
                                class="btn-chat ${classGroup} copy_link_for_chat">
                            ${icons({ name: 'linked', size: 16 })}
                            <span style="font-size: 13px; font-weight: 500; padding: 0px 4px 0px 4px;">
                                Скопировать
                            </span>
                        </a>

                        <a target="_blank"
                            style="padding: 2px; text-decoration: none;"
                                href="https://vk.me/join/${chat.key}"
                                    class="btn-chat ${classGroup}" 
                        >
                            ${icons({ name: 'door_enter_arrow_right_outline', size: 16 })}
                            <span style="font-size: 13px; font-weight: 500; padding: 0px 4px 0px 4px;">
                                ${chat.members.includes(services.VKMainUser.id) ? 'Открыть чат' : 'Присоединиться'}
                            </span>
                        </a>

                        <a target="_blank"
                            style="padding: 2px; text-decoration: none;"
                                class="btn-chat ${classGroup} history_chat" 
                        >
                            ${icons({ name: 'history_backward_outline', size: 16 })}
                            <span style="font-size: 13px; font-weight: 500; padding: 0px 4px 0px 4px;">
                                История
                            </span>
                        </a>
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

    const isFriend = friends.find(friend => member.id === friend.id) !== undefined;

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
                                        ${icons({ name: 'crown_outline', size: 20, fill: 'var(--vkui--color_icon_secondary)' })}
                                    </span>
                                `
                                : ''
                            }
                        </div>
                        <div class="Entity__description">
                            <span style="color: #828282;">
                                ${subTitle 
                                    ? subTitle
                                    : `
                                        ${member?.online ? 'В сети' : member?.last_seen ? `${member.sex === 2 ? 'Был в сети ' : 'Была в сети '}` + moment(member.last_seen.time * 1_000).fromNow().toLowerCase() : ''}
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


function blankNotFound(icon, text, button, height = '280px') {
    return `
        <div style="height: ${height}; display: flex; justify-content: center">
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
                                    <span style="font-weight: 600;" class="FlatButton__content">${button.text}</span>
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


function blankInputSearch({ 
    id = 'search',
    value = '', 
    placeholder = 'Поиск', 
    actionFilter = undefined,
    iconBefore = icons({ name: 'text_outline', size: 18, fill: 'secondary' }),
    button = {
        icon: icons({ name: 'search_stars_outline', size: 20 }),
        title: '',
        id: 'searchChats_button',
        data: ''
    },
    width = '100%',
    style = ''
}) {
    return `
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 3px">
            <div style="width: ${width}; ${style}" class="vkuiInternalSearch vkuiSearch vkuiSearch--sizeY-compact vkuiSearch--has-after vkuiSearch--has-icon vkuiSearch--withPadding App-module__search--_fJCB">
                <div class="vkuiSearch__field">
                    <label for="${id}" class="vkuiSearch__label">
                        ${placeholder}
                    </label>
                    <div class="vkuiSearch__input">
                        ${iconBefore}
                        <input 
                            id="${id}"
                            class="vkuiTypography vkuiTypography--normalize vkuiTypography--weight-3 vkuiSearch__nativeInput vkuiHeadline--sizeY-compact vkuiHeadline--level-1" 
                            type="search"
                            placeholder="${placeholder}" 
                            autocomplete="off" 
                            value="${deXSS(String(value))}"
                            maxLength="150"
                        >
                    </div>
                </div>
            </div>
            ${
                button ? `
                    <button data="${button.data}" ${button.title ? `onmouseover="showTitle(this, '${button.title}')"` : ''} id="${button.id}" class="input-button">
                        ${button.icon}
                    </button>
                ` 
                : ''
            }
            ${
                actionFilter ? `
                    <span class="btn" style="height: 30px; width: 20px;">
                        ${actionFilter}
                    </span>
                `
                : ''
            }
        </div>
    `
}


function blankInputDate({ 
    id = 'input-date',
    value = '', 
    iconBefore = icons({ name: 'star_circle_fill_yellow', size: 17, fill: 'original'}),
    actionFilter = undefined,
    button = {
        icon: icons({ name: 'add', size: 20, fill: 'secondary'}),
        title: '',
        id: 'input-date-button',
        data: ''
    },
    width = '100%',
}) {
    return `
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 3px">
            <div style="width: ${width}" class="vkuiInternalSearch vkuiSearch vkuiSearch--sizeY-compact vkuiSearch--has-after vkuiSearch--has-icon vkuiSearch--withPadding App-module__search--_fJCB">
                <div class="vkuiSearch__field">
                <label class="vkuiSearch__input">
                    ${iconBefore}
                    <input
                        id="${id}"
                        class="vkuiTypography vkuiTypography--normalize vkuiTypography--weight-3 vkuiSearch__nativeInput vkuiHeadline--sizeY-compact vkuiHeadline--level-1" 
                        type="date"
                        autocomplete="off" 
                        value="${deXSS(String(value))}"
                    >
                </div>
            </div>
                <button data="${button.data}" ${button.title ? `onmouseover="showTitle(this, '${button.title}')"` : ''} id="${button.id}" class="input-button">
                    ${button.icon}
                </button>
                ${
                    actionFilter ? `
                        <span class="btn" style="height: 30px; width: 20px;">
                            ${actionFilter}
                        </span>
                    `
                    : ''
                }
        </div>
    `
}


function blankPages({ found, totalPage = 0, currentPage = 0, offset = 0, inOnePage }) {

    let content = '';

    if (found > 0) {
        content = `
            <span style="display: flex; gap: 5px;">
                ${icons({ name: 'document_text_outline', size: 18 })}
                <span style="padding-right: 10px; color: #99a2ad;">
                    Страница №${currentPage} из ${totalPage}
                    ${inOnePage ? ` (${inOnePage.toLocaleString('ru-RU')})` : ''}
                </span>
            </span>

            <span style="display: flex; gap: 5px; font-weight: 500;">
                ${offset > 0 ?
                    `
                        <button class="btn" id="previous_page_button" style="font-weight: 500;"> 
                            Назад
                        </button>
                    `
                    : ''
                }
                ${offset > 0 ? '<span style="padding-left: 2px; padding-right: 2px; ">•</span>' : ''}
                ${totalPage > 0 && currentPage < totalPage ? 
                    `
                        <button class="btn" id="next_page_button" style="font-weight: 500;">
                            Далее
                        </button>
                    ` 
                    : ''
                }
            </span>
        `;
    } else if (found === 'load') {
        content = `
            <span style="display: flex; gap: 5px;">
                ${icons({ name: 'document_text_outline', size: 18 })}
                <span style="padding-right: 10px; color: #99a2ad;">
                    Страницы загружаются
                </span>
            </span>

            <span style="display: flex; gap: 5px; font-weight: 500;">
                <button class="btn" id="next_page_button" style="font-weight: 500;">
                    Далее
                </button>
            </span>
        `;
    } else {
        content = `
            <span style="display: flex; gap: 5px;">
                ${icons({ name: 'document_text_outline', size: 18 })}
                <span style="padding-right: 10px; color: #99a2ad;">
                    Страница пуста
                </span>
            </span>
        `
    }


    return `
        <div style="display: flex; color: #99a2ad; align-items: center; height: 20px;"> 
            ${content}
        </div>
    `;
}


function blankFiltersSearchChats({
    user = false,
    foundChats,
    offset,
    countListChats = 0
}) {
    let typeMention;

    let nameHTML;
    let nameString;

    if (user) {
        typeMention = user?.first_name ? 'id' : 'club';

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

    const tags = services.tags.filter(tag => new RegExp(noSpecialCharacters(filters.tagsFilter), 'i').test(tag)).map(tag => `
        <button target="_blank" class="btn" style="gap: 6px; font-weight: 500; align-items: center;">
            <div class="filter_tags ${tag}" style="display: flex; ${filters.tags.includes(tag) ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''}">${tag}</div>
        </button>
    `).join('');

    return `

    <div style="font-size: 14px; font-weight: 400;">
        
        ${blankInputSearch({
            id: 'searchChats_input',
            value: filters.title, 
            placeholder: filters.isHistory ? 'Поиск из старых названий' : 'Найдётся все, ну... почти',
            button: {
                icon: icons({ name: 'search_stars_outline', size: 20 }),
                title: 'Поиск',
                id: 'searchChats_button',
                data: ''
            },
            actionFilter: blankActionsMenu(
                icons({ name: 'filter_outline', size: 24}),`
                <div style="display: flex; gap: 8px; flex-direction: column; justify-content: center;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 5px; font-weight: 500; font-size: 20px; padding-bottom: 5px; flex-direction: row;">
                        ${icons({ name: 'filter_outline', size: 24 })}
                        <span ${appearance.get() === 'dark' ? '' : 'style="color: #000000"'}> Фильтры </span>
                        <a class="btn" style="font-weight: 500;" id="clear_range_users" onmouseover="showTitle(this, 'Сбросить все фильтры')">
                            ${icons({ name: 'refresh_outline', size: 18 })}
                        </a>
                    </div>

                    ${blankSeparator()}

                    <div style="display: flex; align-items: center;">
                        <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                            <span>
                                ${icons({ name: 'sort_outline', size: 22 })}
                            </span>
                            <label> Сортировать по</label>
                            <select class="btn" style="display: flex; margin: auto; text-align-last: left; font-weight: 500; font-family: ${fontFamilyVK}; box-sizing: border-box;" name="sort_field" id="sort_field" class="sort-select">
                                <option value="added" ${filters.sortField === 'added' ? 'style="display:none;" selected' : ''}>дате добавления</option>
                                <option value="membersCount" ${filters.sortField === 'membersCount' ? 'style="display:none;" selected' : ''}>количеству участников</option>
                                <option value="lastUpdate" ${filters.sortField === 'lastUpdate' ? 'style="display:none;" selected' : ''}>дате обновления</option>
                                <option value="views" ${filters.sortField === 'views' ? 'style="display:none;" selected' : ''}>количеству просмотров</option>
                            </select>
                            <span class="btn" id="filter_set_sort_order" onmouseover="showTitle(this, 'Порядок сортировки сейчас ${filters.sortOrder === 'desc' ? 'по убыванию' : 'по возрастанию'}')">
                                ${icons({ name: filters.sortOrder === 'desc' ? 'arrow_down_outline' : 'arrow_up_outline', size: 16 })}
                            </span>
                        </div>
                    </div>
        
                    ${user ?
                        `
                            <div style="display: flex; align-items: center; font-height: 500;">
                                <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                                    <span>
                                        ${icons({ name: 'user_outline', size: 20 })}
                                    </span>
                                    Чаты, в которых ${filters.isHistory ? user.sex !== 2 ? 'была' : 'был' : 'есть'}

                                    <div style="width: 18px; height: 18px;" 
                                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-18 vkuiImageBase--loaded" role="img">
                                        <img class="vkuiImageBase__img" src="${user.photo_100 || ''}">
                                    </div>
                        
                                    <a id="get_profile" onmouseover="showTitle(this, 'Профиль в «ПоискЧата» — ${nameString}')" style="display: flex;">
                                        ${nameHTML}
                                    </a>
        
                                    <span class="btn" onmouseover="showTitle(this, 'Удалить ${typeMention === 'id' ? 'пользователя' : 'группу'} из фильтра')" id="filter_button_delete_user">
                                        ${icons({ name: 'cross_large_outline', size: 16 })}
                                    </span>
                                </div>
                            </div>

                        ` : ''
                    }
        

                    <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                        <span>
                            ${icons({ name: 'users_3_outline', size: 20 })}
                        </span>
                        Чаты, в которых ${filters.isHistory ? 'были' : 'есть'} <a class="btn" style="font-weight: 500;" target="_blank" href="https://vk.com/friends">Ваши друзья</a>
                        ${blankSwitch({ id: 'filter_only_with_friends', checked: filters.onlyWithFriends })}
                    </div>
                            
                    <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                        <span>
                            ${icons({ name: 'poll_outline', size: 20 })}
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
                        <a class="btn" style="font-weight: 500;" id="clear_range_users" onmouseover="showTitle(this, 'Сбросить')">
                            ${icons({ name: 'cross_large_outline', size: 16 })}
                        </a>
                    </div>
        
                    <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                        <span>
                            ${icons({ name: 'article_box_outline', size: 20 })}
                        </span>
        
                        Поиск из истории чатов
                        ${blankSwitch({ id: 'filter_is_history', checked: filters.isHistory })}
        
                        
                        ${blankHint('Поиск из истории чатов будет осуществляться по старым названиям, а также по чатам, где был участник или Ваши друзья.')} 
                    </div>
        
                    <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                        <span>
                            ${icons({ name: 'fire_alt_outline', size: 20 })}
                        </span>
        
                        Aктивные чаты
                        ${blankSwitch({ id: 'filter_is_active', checked: filters.isActive })}
        
                        ${blankHint('Это те чаты, в которых произошли какие-либо изменения за последние 7 дней.')}
                    </div>
        
                    <div style="display: flex; gap: 5px; color: #99a2ad; align-items: center; height: 20px;">
                        <span>
                            ${icons({ name: 'archive_outline', size: 20 })}
                        </span>
        
                        Aрхивированные чаты
                        ${blankSwitch({ id: 'filter_is_achive', checked: filters.isArchive })}  
        
                        ${blankHint('Это архивированные чаты, которые были удалены и больше неактивны. В них нельзя зайти, но можно посмотреть всю информацию о чате.')}
                    </div>

                    ${blankSeparator()}

                    ${services.tags.length
                        ? `
                            <div style="display: flex; justify-content: center;">
                                <div class="${classGroup}" style="padding-top: 10px; max-width: 350px;">
                                    <div style="display: flex; color: #99a2ad; padding-bottom: 5px; font-size: 13px; font-weight: bold; gap: 5px; justify-content: center; align-items: center;">
                                        ${icons({ name: 'hashtag_outline', size: 20 })}
                                        Теги (${services.tags.length}шт.)
                                    </div>

                                    ${blankInputSearch({ id: 'input_filter_tags', width: '300px', button: null, value: filters.tagsFilter })}

                                    ${blankSeparator("padding-bottom: 15px;")}

                                    <div style="display: flex; justify-content: center; max-height: 200px; overflow-y: auto;">
                                        <span id="filter_tags" style="display: flex; word-break: break-all; flex-wrap: wrap; text-align: center; gap: 6px; justify-content: center;">
                                            ${tags || blankNotFound(icons({ name: 'ghost_simple_outline', size: 86 }), '', undefined, '125px')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `
                        : ''
                    }

                </div>
            `)
        })}
        </div>
        
        <span id="search_chats_pages" style="font-size: 15;"> 
            ${blankPages({ found: foundChats, inOnePage: countListChats, offset, currentPage, totalPage })}
        </span>

        ${isLinkPageOrId(filters.title) ? `
            <div style="display: flex; text-decoration: row; align-items: center;">
                ${blankHint(`В поисковой строке замечен VK ID или ссылка на страницу или группу: ${deXSS(filters.title)}`)}
                <div style="margin-top: 4px" id="search_link" link="${deXSS(filters.title)}" class="btn" style="text-decoration: row;">
                    Вы хотите произвести поиск по странице или группе VK?         
                </div>
            </div>
        ` : ''}
    </div>
    `
}


function blankUsersStack(arrayInfoFriends) {
    return arrayInfoFriends.map((friend, index) => {
        return `<svg onmouseover="showTitle(this, '${friend.name}')" xmlns="http://www.w3.org/2000/svg" className="UsersStack-module__photo--iCBco" aria-hidden="true" style="width: 24px; height: 24px">
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
        </a>
    </svg>`

    }).join('');
}


function blankQuote (text) {
    return `
        <div class="quote">
            <div class="quote__text">
                ${text}
            </div>
        </div>
    `
}


function blankSwitch({id, checked}) {
    return `
        <label class="vkuiSwitch vkuiSwitch--sizeY-compact Settings__switch" style="margin: 0px;">
            <input id="${id}" class="vkuiVisuallyHidden vkuiSwitch__self" type="checkbox" ${checked ? 'checked' : ''}>
            <span aria-hidden="true" class="vkuiSwitch__pseudo"></span>
            <div class="vkuiFocusVisible vkuiFocusVisible--mode-outside" aria-hidden="true"></div>
        </label>
    `
    // </ui>
}


function blankHint(content, label = '') {
    const html = deXSS(`<div style="text-wrap: wrap; overflow: visible;"> ${content} </div>`);

    return `
        <div style="margin-bottom: 1px;">
            <span ${!label ? 'class="hint_icon"' : ''} style="margin-left: 0px;" data-title="${html}" onmouseover="showHint(this);">
                ${label}
            </span>
        </div>`;
}


function blankActionsMenu (label, content, title = '') {
    return `
    <div style="display: flex; align-items: center; justify-content: center;" class="im-page--header-more im-page--header-menu-button _im_dialog_action_wrapper"> 
        <div class="ui_actions_menu_wrap _ui_menu_wrap" onmouseover="window.uiActionsMenu &amp;&amp; uiActionsMenu.show(this);" onmouseout="window.uiActionsMenu &amp;&amp; uiActionsMenu.hide(this);"> 
            <div tabindex="0" aria-label="Действия" role="button" onclick="uiActionsMenu.keyToggle(this, event)" ${title ? `onmouseover="showTitle(this, '${title}')"` : ''}> 
                    ${label}
                <span class="blind_label">
                    Действия
                </span> 
            </div> 
            <div class="ui_actions_menu _ui_menu im-page--redesigned-menu" style="width: fit-content; max-width: fit-content; padding: 10px; margin: 0px; cursor: default;">
                <div style="font-size: 14px; font-weight: 400;">
                    ${content}
                </div>
            </div>
        </div>
    </div>`;
}


function blankMention ({id, type, text}) {
    return `<a 
        href="/${type}${id}" 
        mention=""
        mention_id="${type}${id}" 
        onclick="return mentionClick(this, event)" 
        onmouseover="mentionOver(this)"
        style="display: flex;"
    >
        ${text}
    </a>`
}
