function buttonInProfiles(elementButtons) {
    const newButtonGetChats = document.createElement('div');
    const newButtonGetProfile = document.createElement('div');

    const wrapper = document
        .getElementsByClassName('ScrollStickyWrapper')[0]
        ?.getElementsByTagName('div')[0];

    if (wrapper) {

        let actions = wrapper?.getElementsByClassName('RedesignedPageBlockContainer')[0];

        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'RedesignedPageBlockContainer';

            wrapper.prepend(actions);
        }

        const icon = `
            <div class="vkuiSimpleCell__after vkuiInternalSimpleCell__after">
                <svg aria-hidden="true" display="block" class="vkuiIcon vkuiIcon--24 vkuiIcon--w-16 vkuiIcon--h-24 vkuiIcon--chevron_compact_right_24 getColorClass-module__colorIconTertiary--DV2sA" viewBox="0 0 16 24" width="16" height="24" style="width: 16px; height: 24px;">
                    <use xlink:href="#chevron_compact_right_24" style="fill: currentcolor;"></use>
                </svg>
            </div>
        `;

        newButtonGetChats.className = 'page_block';

        newButtonGetChats.onclick = () => searchChats(filters.link = window.location.href);

        newButtonGetChats.innerHTML = `
            <aside aria-label="Действия со страницей">
                <div class="profile_actions">
                    <div class="page_actions_expanded _page_actions_container">
                        <a tabindex="0" role="button" class="PageActionCell">
                            <div class="PageActionCell__icon" aria-hidden="true">
                                ${icons({ name: 'search_stars_outline', realSize: 24, fill: 'accent' })}
                            </div>
                            <span class="PageActionCell__in">
                                <span class="PageActionCell__label">
                                    Чаты пользователя
                                </span>
                            </span>
                            ${icon}
                        </a>
                    </div>
                </div>
            </aside>
        `;

        actions.prepend(newButtonGetChats);

        newButtonGetProfile.className = 'page_block';

        newButtonGetProfile.onclick = () => showProfile({ id: window.location.href });

        newButtonGetProfile.innerHTML = `
            <aside aria-label="Действия со страницей">
                <div class="profile_actions">
                    <div class="page_actions_expanded _page_actions_container">
                        <a tabindex="0" role="button" class="PageActionCell">
                            <div class="PageActionCell__icon" aria-hidden="true">
                                ${icons({ name: 'profile', realSize: 28, size: 24, fill: 'accent' })}
                            </div>
                            <span class="PageActionCell__in">
                                <span class="PageActionCell__label">
                                    Профиль в «ПоискЧата»
                                </span>
                            </span>
                            ${icon}
                        </a>
                    </div>
                </div>
            </aside>
        `;

        actions.prepend(newButtonGetProfile);
    } else {
        const actions = document
            .getElementsByClassName('ProfileHeaderActions__moreButtonContainer')[0]
            ?.getElementsByTagName('div')[0];

        if (actions) {
            actions.style.display = 'flex';
            actions.style.flexDirection = 'row';
        }

        newButtonGetChats.className = 'ProfileHeaderButton';

        newButtonGetChats.onclick = () => searchChats(filters.link = window.location.href);

        newButtonGetChats.innerHTML = `
            <a title="Чаты пользователя" class="vkuiButton vkuiButton--size-m vkuiButton--mode-secondary vkuiButton--appearance-accent vkuiButton--align-center vkuiButton--with-icon vkuiButton--singleIcon vkuiTappable vkuiInternalTappable vkuiTappable--hasHover vkuiTappable--hasActive">
                    <span class="vkuiButton__in">
                        <span class="vkuiButton__before" role="presentation">
                            ${icons({ name: 'search_stars_outline', realSize: 24, fill: appearance.get() === 'dark' ? 'white' : 'textAccentThemed', size: 20 })}
                        </span>
                    </span>
                <div class="vkuiFocusVisible vkuiFocusVisible--mode-outside" aria-hidden="true"></div>
            </a>
        `;

        elementButtons.after(newButton);
    }
}