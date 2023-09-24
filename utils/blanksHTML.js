const separator = `
<div class="vkuiGroup__separator vkuiGroup__separator--spacing vkuiSpacing" style="height: 16px; padding: 4px 0px;"></div>
<div class="vkuiSeparator vkuiSeparator--padded vkuiGroup__separator vkuiGroup__separator--separator">
    <hr class="vkuiSeparator__in">
</div>`;

function blankChat({ chat, photo, creator }) {
    const typeMention = creator?.last_name ? 'id' : 'club';

    const creatorUrl = `https://vk.com/${typeMention}${creator.id}`;
    const name = typeMention === 'id'
        ? `${creator.first_name} ${creator.last_name}`
        : `группа «${creator.name}»`;

    return `
        ${separator}

        <section class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-plain vkuiInternalGroup--mode-plain vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo">
            
            <div class="ProfileModalInfoHeadline" style="padding-top: 0px; padding-bottom: 0px; padding-left: 10px;">
            
                <div id="raw" style="margin-bottom: 15px;">

                    <div style="width: 48px; height: 48px;" 
                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-48 vkuiImageBase--loaded" 
                            role="img">
                        <img class="vkuiImageBase__img" src="${photo}">
                    </div>

                    <div>
                        <h4 style="font-size: 18px;"
                            class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1">
                            ${chat.title}
                        </h4>
                        <div id="raw" style="gap: 5px">
                            <div style="font-weight: 600;">
                                ${chat.membersCount.toLocaleString('ru-RU')} ${decOfNum(chat.membersCount, ['участник', 'участника', 'участников'])}
                            </div>
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
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    Создатель
                    <a target="_blank" "style="font-weight: bold;" href="${creatorUrl}">
                        ${name}
                    </a>
                </div>
            </div>
        </section>
    `;
};