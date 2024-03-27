function adminButtonInTopProfileMenu() {
    return `
        <a id="admin_panel" class="top_profile_mrow">
            <span style="display: flex; align-items: center; gap: 5px;">
                ${icons({ name: 'wrench_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Админ панель
            </span>
        </a>
    `    
}


function buttonsInTopProfileMenu(topProfileMenu) {

    const menu = document.createElement('div');


    menu.innerHTML = `
            <div class="vkuiSpacing" style="height: 16px; padding: 8px 0px;"><div class="vkuiSeparator vkuiSeparator--padded"><hr class="vkuiSeparator__in"></div></div>
    
            <a class="top_profile_mrow" href="#"
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                    cursor: default;
                    padding-bottom: 5px;
                "
            >
                <span style="display: flex; align-items: center; gap: 10px;">
                    ${logo}
                    Меню «ПоискЧата»
                </span>
            </a>
            
            <a id="profile" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ 
                        name: services.profileFromSC.isSubscriptionValid ? 'user_star_outline' : 'user_card_outline', 
                        fill: 'var(--vkui--color_icon_accent)', 
                        size: 22 
                    })}
                    Профиль
                </span>
            </a>
            <a id="search_chats" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'list_bullet_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Список чатов
                </span>
            </a>
            <a id="stats" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'statistics_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Статистика и топы
                </span>
            </a>
            <a id="add_chat" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'message_add_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Добавить чат
                </span>
            </a>
            <a id="shop" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'shopping_cart_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Магазин
                </span>
            </a>
            <a id="remove_token_vk" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'switch_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Обновить токен VK
                </span>
            </a>
            <a target="_blank" href="${services.github.userScriptLink}" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'gear_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Обновить расширение
                </span>
            </a>
            <a target="_blank" href="https://t.me/chatsvkbot_chat" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'location_outline', fill: 'var(--vkui--color_icon_accent)', size: 22 })} Чат в телеграм
                </span>
            </a>
            ${services.profileFromSC.role > 0 ? adminButtonInTopProfileMenu() : ''}
    `;

    topProfileMenu.append(menu);

    onClicks('buttonsInTopProfileMenu', {})
}