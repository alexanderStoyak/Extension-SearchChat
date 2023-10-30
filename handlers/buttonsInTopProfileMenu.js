function adminButtonInTopProfileMenu() {
    return `
        <a id="admin_panel" class="top_profile_mrow">
            <span style="display: flex; align-items: center; gap: 5px;">
                ${icons({ name: 'wrench_outline', fill: 'iconsAccent', realSize: 28 ,size: 22 })} Админ панель
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
                    Меню «ПоискЧата»
                </span>
            </a>
            
            <a id="profile" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'profile', fill: 'iconsAccent', realSize: 28 ,size: 22 })} Профиль
                </span>
            </a>
            <a id="search_chats" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'list_bullet_outline', fill: 'iconsAccent', realSize: 20 , size: 22 })} Список чатов
                </span>
            </a>
            <a id="stats" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'favorite_outline', fill: 'iconsAccent', realSize: 20 ,size: 22 })} Статистика и топ
                </span>
            </a>
            <a id="add_chat" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'message_add_outline', fill: 'iconsAccent', realSize: 20 ,size: 22 })} Добавить чат
                </span>
            </a>
            <a id="shop" class="top_profile_mrow">
                <span style="display: flex; align-items: center; gap: 5px;">
                    ${icons({ name: 'shopping_cart_outline', fill: 'iconsAccent', realSize: 20 ,size: 22 })} Магазин
                </span>
            </a>
            ${services.profileFromSC.role > 0 ? adminButtonInTopProfileMenu() : ''}
    `;

    topProfileMenu.append(menu);

    onClicks('buttonsInTopProfileMenu', {})
}