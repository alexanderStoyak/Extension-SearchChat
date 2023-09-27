function buttonInProfiles(elementButtons) {
    const newButton = document.createElement('div');

    newButton.className = 'ProfileHeaderButton';

    newButton.onclick = () => onClickButtonForChats(window.location.href, 0);

    newButton.innerHTML = `
        <a class="vkuiButton vkuiButton--size-m vkuiButton--mode-secondary vkuiButton--appearance-accent vkuiButton--align-center vkuiTappable vkuiInternalTappable vkuiTappable--hasHover vkuiTappable--hasActive">
            <span class="vkuiButton__in">
                <span class="vkuiButton__content" style="display: flex; align-items: center;">
                    Чаты
                </span>
            </span>
            <span aria-hidden="true" class="vkuiFocusVisible vkuiFocusVisible--mode-outside"/>
        </a>
    `;

    elementButtons.after(newButton);
};