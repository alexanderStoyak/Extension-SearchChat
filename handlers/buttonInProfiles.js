
let offset = 0;
let isLoad = false;
const onClickForButtonInProfiles = async () => {
    if (isLoad) {
        return;
    } else {
        isLoad = true;
    };

    const [user] = await getUsersOrGroups([window.location.href]);

    const foundChats = await SCAPI.call({
        parameters: { userId: user.id, offset }
    });

    if (!foundChats.found) {
        return notifiers(`Не смог найти чаты где мог бы быть <a style="font-weight: bold;" href="${window.location.href}"> ${user.first_name} ${user.last_name} </a>`);
    }

    const creators = await getUsersOrGroups(
        foundChats.chats.map(chat => chat.creator)
    );

    if (modalPage && modalPage.isVisible()) {
        modalPage.hide();
    };

    newModalPage(`Чаты в которых находится <a style="font-weight: bold;" href="${window.location.href}"> ${user.first_name} ${user.last_name} </a> (${foundChats.found.toLocaleString('ru-RU')}шт.)`);

    let listChatsHTML = foundChats.chats.map((chat, index) => {
        const photo = chat.photo
            ? chat.photo['200'] || chat.photo['150'] || chat.photo['50']
            : '';

        return blankChat({ chat, photo, creator: creators[index] });
    }).join('');

    listChatsHTML += `<div style="display: flex; justify-content: flex-end; gap: 5px">`;
    listChatsHTML += `<span style="padding-right: 25px"> Страница ${offset / 15 !== 0 ? offset / 15 + 1 : 1}/${Math.ceil(foundChats.found / 10 || 1)} </span>`;
    
    if (foundChats.found > 15) {
        if (offset > 0) {
            listChatsHTML += `
                <a id="previousPageButton" 
                    style="text-decoration: none; font-weight: bold;"> 
                    Назад
                </a>
                •
            `;
        };

        listChatsHTML += `
            <a id="nextPageButton" 
                style="padding-right: 10px; text-decoration: none; font-weight: bold;"> 
                Далее
            </a>
        `;
    };
    listChatsHTML += `</div>`;

    modalPage.content(listChatsHTML);

    modalPage.show();

    const nextPageButton = document.getElementById('nextPageButton');
    const previousPageButton = document.getElementById('previousPageButton');
    if (nextPageButton) {
        nextPageButton.onclick = () => {
            onClickForButtonInProfiles(offset += 15);
        };
    };
    if (previousPageButton) {
        previousPageButton.onclick = () => {
            onClickForButtonInProfiles(offset -= 15);
        };
    };

    isLoad = false;
};

function buttonInProfiles(buttonsElement) {
    const newButton = document.createElement('div');

    newButton.className = 'ProfileHeaderButton';

    newButton.onclick = onClickForButtonInProfiles;

    newButton.innerHTML = `
            <a class="vkuiButton vkuiButton--size-m vkuiButton--mode-secondary vkuiButton--appearance-accent vkuiButton--align-center vkuiTappable vkuiInternalTappable vkuiTappable--hasHover vkuiTappable--hasActive">
                <span class="vkuiButton__in">
                    <span class="vkuiButton__content" style="display: flex; align-items: center;">
                        Чаты
                    </span>
                </span>
                <span aria-hidden="true" class="vkuiFocusVisible vkuiFocusVisible--mode-outside"/>
            </a>`;

    buttonsElement[0].after(newButton);
};
