
let offset = 0;
const onClickForButtonInProfiles = async () => {
    const user = await getUserOrGroupId(window.location.href);

    const foundChats = await SCAPI.call({
        parameters: { userId: user.id, offset }
    });

    if(!foundChats.found) {
        return notifiers(`Похоже что ${user.first_name} ${user.last_name} нигде не сидит :(`);
    }

    const modalPage = newModalPage(`Чаты в которых находиться ${user.first_name} ${user.last_name} (${foundChats.found})`);

    let listChatsHTML = foundChats.chats.map(chat => {
        const photo = chat.photo ? chat.photo['200'] || chat.photo['150'] || chat.photo['50'] : '';
        const creatorUrl = chat.creator > 0 ? `https://vk.com/id${chat.creator}` : `https://vk.com/club${-chat.creator}`;

        return blankChat({ chat, photo, creatorUrl });
    }).join('');

    
    modalPage.content(listChatsHTML);
    modalPage.show();
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