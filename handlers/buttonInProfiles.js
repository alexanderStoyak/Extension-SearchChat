function buttonInProfiles(elementButtons) {
    const newButton = document.createElement('div');

    const actions = document
        .getElementsByClassName('ProfileHeaderActions__moreButtonContainer')[0]
        ?.getElementsByTagName('div')[0];

    if(actions) {
        actions.style.display = 'flex';
        actions.style.flexDirection = 'row';
    }

    newButton.className = 'ProfileHeaderButton';

    newButton.onclick = () => userOrGropChats(window.location.href, 0);

    newButton.innerHTML = `
         <a title="Чаты пользователя" class="vkuiButton vkuiButton--size-m vkuiButton--mode-secondary vkuiButton--appearance-accent vkuiButton--align-center vkuiButton--with-icon vkuiButton--singleIcon vkuiTappable vkuiInternalTappable vkuiTappable--hasHover vkuiTappable--hasActive">
                <span class="vkuiButton__in">
                    <span class="vkuiButton__before" role="presentation">
                        ${icons({name: 'search_stars_outline', realSize: 24, fill: appearance === 'dark' ? 'white' : 'textAccentThemed', size: 20})}
                    </span>
                </span>
            <div class="vkuiFocusVisible vkuiFocusVisible--mode-outside" aria-hidden="true"></div>
         </a>
    `;

    elementButtons.after(newButton);
}