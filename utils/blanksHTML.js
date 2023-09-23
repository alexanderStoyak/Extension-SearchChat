function blankChat({ chat, photo, creatorUrl }) {
    return `
        <div class="vkuiGroup__separator vkuiGroup__separator--spacing vkuiSpacing" style="height: 16px; padding: 8px 0px;"></div>
        <div class="vkuiSeparator vkuiSeparator--padded vkuiGroup__separator vkuiGroup__separator--separator">
            <hr class="vkuiSeparator__in">
        </div>

        <section class="vkuiInternalGroup vkuiGroup vkuiGroup--mode-plain vkuiInternalGroup--mode-plain vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo">
            
            <div class="ProfileModalInfoHeadline" style="padding-bottom: 0px;">
            
                <div id="raw" style="margin-bottom: 24px;">

                    <div style="width: 58px; height: 58px;" 
                        class="vkuiAvatar vkuiImageBase vkuiImageBase--size-58 vkuiImageBase--loaded" 
                            role="img">
                        <img class="vkuiImageBase__img" src="${photo}">
                    </div>

                    <div id="cell">
                        <h4 style="font-size: 17px;"
                            class="vkuiHeadline vkuiHeadline--sizeY-compact vkuiHeadline--level-1 vkuiTypography--normalize vkuiTypography--weight-1">
                            ${chat.title}
                        </h4>
                        <div class="ProfileModalInfoRow__label">
                            Участников: ${chat.membersCount}
                        </div>
                    </div>
                </div>

                <a target="_blank" 
                    style="max-width: 150px;"
                        href="https://vk.me/join/${chat.key}"
                            class="vkuiButton vkuiButton--size-m vkuiButton--mode-secondary vkuiButton--appearance-accent vkuiButton--align-center vkuiButton--stretched vkuiTappable vkuiInternalTappable vkuiTappable--hasHover vkuiTappable--hasActive">
                    <span class="vkuiButton__in">
                        <span class="vkuiButton__content">
                            Присоединиться
                        </span>
                    </span>
                    <span aria-hidden="true" class="vkuiFocusVisible vkuiFocusVisible--mode-outside"></span>
                </a>

            </div>
        </section>
    `;
};