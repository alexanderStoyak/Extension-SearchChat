const separator = `
<div class="vkuiGroup__separator vkuiGroup__separator--spacing vkuiSpacing" style="height: 16px; padding: 4px 0px;"></div>
<div class="vkuiSeparator vkuiSeparator--padded vkuiGroup__separator vkuiGroup__separator--separator">
    <hr class="vkuiSeparator__in">
</div>`;

function blankChat({ chat, photo, creator, friends }) {
    const typeMention = creator?.first_name ? 'id' : 'club';

    const creatorUrl = `https://vk.com/${typeMention}${creator.id}`;
    const nameHTML = typeMention === 'id'
        ? `<span style="max-width: 150px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.first_name)} ${deXSS(creator.last_name)}</span>`
        : `Группа «<span style="max-width: 150px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${deXSS(creator.name)}</span>»`;
    
    const nameString = deXSS(typeMention === 'id'
        ? `${creator.first_name} ${creator.last_name}`
        : `Группа «${creator.name}»`
    );

    chat.title = deXSS(chat.title);

    const photoFriends = friends.filter(friend => chat.members.includes(friend.id)).map(friend => friend.photo_100);
    const countFriendsInChat = photoFriends.length;
    photoFriends.splice(3);

    return `
        <div class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard">
            <section class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-plain vkuiInternalGroup--mode-plain vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo">
                
                <div class="ProfileModalInfoHeadline" style="padding: 5px;">
                       
                    <div class="background-image-chat" style="
                        background-image: linear-gradient( 
                            ${
                                appearance === 'dark'
                                    ? 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)' 
                                    : 'rgba(255, 255, 255, .8), rgba(255, 255, 255, .8)'
                            }), 
                            url(${photo || 'https://vk.com/images/community_200.png'});
                    ">      
                    </div>
            
                    <div id="raw" style="margin-bottom: 5px; position: relative; gap: 15px; z-index: 3; justify-content: space-between;">

                        <div id="raw" style="margin-bottom: 10px; gap: 15px;">
                            <div title="Скопировать ссылку на чат" style="width: 58px; height: 58px; box-shadow: 0 0 0 0.1em;" link="vk.me/join/${chat.key}"
                                class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded copyLinkForChat" role="img">
                                <img class="vkuiImageBase__img" src="${photo || 'https://vk.com/images/community_200.png'}">
                            </div>

                            <div>
                                <h4 title="${chat.title}" class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1" style="font-size: 15px; max-width: 230px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                    ${chat.title}
                                </h4>
                            
                            <span style="color: #99a2ad; display: flex; flex-direction: row; gap: 5px; align-items: center;">
                                ${icons({name: 'replay', size: 16, fill: 'secondary'})}
                                <p style="max-width: 180px; margin: 0px;">Обновлен ${moment(chat.lastUpdate).fromNow()}</p>
                            </span>
                            
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: row; gap: 5px; align-items: center;">
                            <a class="membersChat" style="font-weight: 500; color: #99a2ad; text-decoration-color: #99a2ad;">
                                ${chat.membersCount.toLocaleString('ru-RU')} ${decOfNum(chat.membersCount, ['участник', 'участника', 'участников'])}
                            </a>
                            ${icons({name: 'users_2_outline', realSize: 16, size: 16, fill: 'secondary'})}
                        </div>
                    </div>
                    
                    
                    <div style="gap: 5px; display: flex; align-items: center; justify-content: space-between;">
                        <div class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard">
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
                                    ${icons({name: 'add', size: 16, fill: 'secondary'})}
                                    <p style="max-width: 180px; margin: 0px;">Добавлен ${moment(chat.added).fromNow()}</p>
                                </span>
    
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: flex-end; flex-direction: column;">
                            ${
                                countFriendsInChat ? `
                                    <div style="display: flex; justify-content: flex-end; gap: 5px; align-items: center;">
                                        <div class="UsersStack-module__root--HKcQf UsersStack-module__sizeS--O9MMO UsersStack-module__directionRow--HjNuZ ProfileFullStacks__stacks">
                                            <div class="UsersStack-module__photos--bCsMG" aria-hidden="true">
                                                ${usersStack(photoFriends)}
                                            </div>
                                        </div>
                                        <span style="color: #99a2ad; font-weight: 400;">
                                            ${countFriendsInChat.toLocaleString('ru-RU')} ${decOfNum(countFriendsInChat, ['друг', 'друга', 'друзей'])} в чате
                                        </span>
                                    </div>`
                                : ''
                            }
                            <div style="display: flex; text-align: right; align-items: center; flex-direction: row; gap: 5px; justify-content: flex-end;">
                                <a target="_blank" href="https://vk.me/join/${chat.key}" style=" font-weight: 500;gap: 3px;text-decoration-color: #99a2ad;color: #99a2ad;">
                                    Присоединиться
                                </a>
                                ${icons({name: 'door_enter_arrow_right_outline', realSize: 16, size: 16, fill: 'secondary'})}
                            </div>
                        <div>
                    </div>
                </div>
            </section>
        </div>
    `;
}


function blankMembersList({ member, creator, friends }) {
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
                            <a target="_blank" href="${link}" ${isFriend ? `style="color: ${appearance === 'dark' ? '#A8E4A0' : '#258b17'};"` : ''}>
                                <span style="font-weight: bold;">${memberName}</span>
                            </a>
                            ${
                                Math.abs(creator) === member.id
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
                                ${member?.online ? 'В сети' : member?.last_seen ? `${member.sex === 2 ? 'Был ' : 'Была '}` + moment(member.last_seen.time * 1_000).fromNow() : ''}
                                ${typeMention === 'club' ? 'Бот' : ''}
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


function blankNotFound(icon, text) {
    return `
        <div style="height: 280px; display: flex; justify-content: center">
            <div style="display: flex; align-items: center; flex-direction: column; justify-content: center;">
                ${icon}
                <span style="font-size: 13px; padding-top: 3px; text-align: center; max-width: 250px;">
                    ${text}
                </span>
            </div>
        <div>
    `
}


function blankPagination (currentPage, totalPage) {
    return `
        <div style="display: flex; max-height: 27px; align-items: center; flex-direction: row; justify-content: space-between;"> 
            
             <a id="previousPageButton" class="btn-pagination">
                < Назад
             </a>
            
            <p style="margin: 0px;">${currentPage}/${totalPage}</p>
            
            <a id="nextPageButton" class="btn-pagination">
                Далее >
            </a>
            
        </div> 
    `
}