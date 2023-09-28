const separator = `
<div class="vkuiGroup__separator vkuiGroup__separator--spacing vkuiSpacing" style="height: 16px; padding: 4px 0px;"></div>
<div class="vkuiSeparator vkuiSeparator--padded vkuiGroup__separator vkuiGroup__separator--separator">
    <hr class="vkuiSeparator__in">
</div>`;

function blankChat({ chat, photo, creator, friends }) {
    const typeMention = creator?.first_name ? 'id' : 'club';

    const creatorUrl = `https://vk.com/${typeMention}${creator.id}`;
    const name = typeMention === 'id'
        ? `${creator.first_name} ${creator.last_name}`
        : `группа «${creator.name}»`;

    const photoFriends = friends.filter(friend => chat.members.includes(friend.id)).map(friend => friend.photo_100);
    const countFriendsInChat = photoFriends.length;
    photoFriends.splice(5);

    return `
        ${separator}

        <section class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-plain vkuiInternalGroup--mode-plain vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo">
            
            <div class="ProfileModalInfoHeadline" style="padding-top: 0px; padding-bottom: 0px; padding-left: 10px;">
            
                <div id="raw" style="margin-bottom: 15px; gap: 15px">

                    <div style="width: 58px; height: 58px;" 
                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded" 
                            role="img">
                        <img class="vkuiImageBase__img" src="${photo}">
                    </div>

                    <div>
                        <h4 style="font-size: 18px;"
                                class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1">
                            ${chat.title}
                        </h4>

                        <div id="raw" style="gap: 5px">
                            <a class="membersChat link" style="font-weight: 600; text-decoration: none; color: #99a2ad;">
                                ${chat.membersCount.toLocaleString('ru-RU')} ${decOfNum(chat.membersCount, ['участник', 'участника', 'участников'])}
                            </a>
                            •
                            <a target="_blank"
                                style=
                                    "
                                        justify-content: flex-end;
                                        font-weight: bold;
                                        padding-right: 10px;
                                    "
                                    href="https://vk.me/join/${chat.key}">
                                Присоединиться
                            </a>
                        </div>
                        
                        <a class="copyLinkForChat" link="vk.me/join/${chat.key}">
                            Скопировать
                        </a>
                    </div>
                </div>
                
                ${
                    countFriendsInChat ? `
                        <div id="raw" style="gap: 5px">
                            <div class="UsersStack-module__root--HKcQf UsersStack-module__sizeS--O9MMO UsersStack-module__directionRow--HjNuZ ProfileFullStacks__stacks">
                                <div class="UsersStack-module__photos--bCsMG" aria-hidden="true">
                                    ${usersStack(photoFriends)}
                                </div>
                            </div>
                            <span style="color: #99a2ad; font-weight: 500;">
                                ${countFriendsInChat.toLocaleString('ru-RU')} ${decOfNum(countFriendsInChat, ['друг', 'друга', 'друзей'])} в чате
                            </span>
                        </div>`
                    : ''
                }
                
                <div style="display: flex; gap: 5px; font-weight: 500; color: #99a2ad;">
                    Создатель
                    <a target="_blank" href="${creatorUrl}">
                        ${name}
                    </a>
                    <div style="width: 20px; height: 20px;" 
                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" 
                            role="img">
                        <img class="vkuiImageBase__img" src="${creator.photo_100 || ''}">
                    </div>
                </div>
            </div>
        </section>
    `;
}


function blankMembersList({ member, creator, friends }) {
    const typeMention = member?.first_name ? 'id' : 'club';
    const link = `https://vk.com/${typeMention}${member.id}`;
    const memberName = typeMention === 'id'
        ? `${member.first_name} ${member.last_name}`
        : `Группа «${member.name}»`;

    const isFriend = friends.filter(friend => member.id === friend.id).length !== 0;

    return `
        <li class="ListItem ListItem--can-be-hovered" style="padding-left: 10px">
            <div class="ListItem__main">
                <div class="Entity">
                    <div class="Entity__aside vkuiAvatar vkuiImageBase vkuiImageBase--size-48 vkuiImageBase--loaded">
                        <img class="vkuiImageBase__img" target="_blank" src="${member?.photo_100 || ''}" />
                    </div>

                    <div class="Entity__main">
                        <div class="Entity__title">
                            <a target="_blank" href="${link}" ${isFriend ? 'style="color: #A8E4A0;"' : ''}>
                                <span style="font-weight: bold;">${memberName}</span>
                            </a>
                            ${Math.abs(creator) === member.id ? '<span style="color: #828282; padding-left: 12px" >Создатель</span>' : ''}
                        </div>
                        <div class="Entity__description">
                            <span style="color: #828282;">
                                ${member?.online ? 'В сети' : member?.last_seen ? 'Последний вход ' + new Date(member.last_seen.time * 1_000).toLocaleString("ru-RU") : ''}
                                ${typeMention === 'club' ? 'Бот' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `;
}