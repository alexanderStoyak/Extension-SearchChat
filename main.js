const classesHandlers = [
    'im-mess',
    '_sticker_hints',
    'page_block',
    'Profile',
    'nim-conversation-search-row',
    'idd_selected_value',
    'im-mess--check',
    'im-page--title'
];


function findAll(array, predicate) {
    const found = [];

    for (const current of array) {
        if (
            predicate(current) &&
            !found.find(x => JSON.stringify(x) === JSON.stringify(current))
        ) {
            found.push(current);
        }
    }

    return found;
}


const observeChange = async () => {
    const body = document.querySelector('body');

    moment.locale('ru');
    appearance.update(body);
    modalPage = new managingModelPages();

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

        const mutationsForTargets = findAll(mutations, mutation =>
            mutation.target instanceof HTMLElement
            && classesHandlers.find(className => mutation.target.classList.contains(className))
        );



        if (mutationsForTargets.find(mutation => mutation.target.classList.contains('im-mess'))) {
            const [peerHistory] = document.getElementsByClassName('_im_peer_history');

            if (peerHistory) {
                buttonInMessages(peerHistory);
            }
        }

        if (mutationsForTargets.find(mutation => mutation.target.classList.contains('idd_selected_value'))) {
            appearance.update(body);
        }



        const mutationsForAddedNodes = findAll(mutations, mutation =>
            [...mutation.addedNodes].find(node =>
                node instanceof HTMLElement
                && classesHandlers.find(className => node.classList.contains(className))
            )
        );

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

                if (classList.contains('im-mess--check') || classList.contains('im-page--title')) {
                    const [peerHistory] = document.getElementsByClassName('_im_peer_history');

                    if (peerHistory) {
                        buttonInMessages(peerHistory);
                    }
                }
            }
        }



        const mutationsForNextSibling = findAll(mutations, mutation =>
            mutation.nextSibling instanceof HTMLElement
            && classesHandlers.find(className => mutation.nextSibling.classList.contains(className))
        )

        if (mutationsForNextSibling.find(mutation => mutation.nextSibling.classList.contains('nim-conversation-search-row'))) {
            const dialogsSearch = document.getElementById('im_dialogs_search');

            buttonInDialogsSearch(dialogsSearch);
        }
    });

    observer.observe(body, {
        childList: true,
        subtree: true,
        characterData: false
    });
};

document.addEventListener('DOMContentLoaded', observeChange);