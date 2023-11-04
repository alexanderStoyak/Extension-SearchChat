const classesHandlers = [
    'im-mess',
    '_sticker_hints',
    'post_field_warning',
    'chat_onl_wrap',
    'page_block',
    'Profile',
    'nim-conversation-search-row',
    'idd_selected_value'
];


const observeChange = async () => {
    moment.locale('ru');
    const body = document.querySelector('body');
    appearance.update(body);
    modalPage = new ModalPage();

    if (!await checkValidToken()) {
        return;
    }

    const [profileHeaderActions] = document.getElementsByClassName('ProfileHeaderButton');
    const pageActions = document.getElementById('page_actions');
    const topProfileMenu = document.getElementById('top_profile_menu');

    if (profileHeaderActions) {
        buttonInProfiles(profileHeaderActions);
    }

    if (pageActions) {
        buttonInProfilesForGroups(pageActions);
    }

    if (topProfileMenu) {
        buttonsInTopProfileMenu(topProfileMenu);
    }




    const observer = new MutationObserver(mutations => {
        const mutationsForTargets = mutations.filter(mutation =>
            mutation.target instanceof HTMLElement
            && classesHandlers.find(className => mutation.target.classList.contains(className))
        )

        if (mutationsForTargets.find(mutation => mutation.target.classList.contains('im-mess'))) {
            const [peerHistory] = document.getElementsByClassName('_im_peer_history');

            if (peerHistory) {
                buttonInMessages(peerHistory);
            }
        }

        if (mutationsForTargets.find(mutation => mutation.target.classList.contains('idd_selected_value'))) {
            appearance.update(body);
        }




        const mutationsForAddedNodes = mutations.filter(mutation =>
            [...mutation.addedNodes].find(node =>
                node instanceof HTMLElement
                && classesHandlers.find(className => node.classList.contains(className))
            )
        )

        for (const mutation of mutationsForAddedNodes) {
            for (const { classList } of mutation.addedNodes) {
                if (!classList) {
                    continue;
                }


                if (classList.contains('page_block')) {
                    const pageActions = document.getElementById('page_actions');

                    if (pageActions) {
                        buttonInProfilesForGroups(pageActions);
                    }
                }


                if (classList.contains('Profile')) {
                    const [profileHeaderActions] = document.getElementsByClassName('ProfileHeaderButton');

                    if (profileHeaderActions) {
                        buttonInProfiles(profileHeaderActions);
                    }
                }


                if (classList.contains('_sticker_hints')) {
                    const [peerHistory] = document.getElementsByClassName('_im_peer_history');

                    if (peerHistory) {
                        buttonInMessages(peerHistory);
                    }
                }

                if (classList.contains('im-mess')) {
                    const [peerHistory] = document.getElementsByClassName('_im_peer_history');
        
                    if (peerHistory) {
                        buttonInMessages(peerHistory);
                    }
                }
            }
        }




        const mutationsForNextSibling = mutations.filter(mutation =>
            mutation.nextSibling instanceof HTMLElement
            && classesHandlers.find(className => mutation.nextSibling.classList.contains(className))
        )

        if (mutationsForNextSibling.find(mutation => mutation.nextSibling.classList.contains('nim-conversation-search-row'))) {
            const dialogsSearch = document.getElementById('im_dialogs_search');

            buttonInDialogsSearch(dialogsSearch);
        }
    });

    observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeChange;