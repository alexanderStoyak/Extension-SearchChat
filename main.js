const observeChange = async () => {
    if (!services.access_token) {
        if (!services.timeStampAuthModalPage || services.timeStampAuthModalPage < +new Date) {
            authModalPage();
        }

        return;
    }

    const body = document.querySelector("body");

    const [profileHeaderActions] = document.getElementsByClassName('ProfileHeaderButton');
    const pageActions = document.getElementById('page_actions');


    if (profileHeaderActions) {
        buttonInProfiles(profileHeaderActions);
    }


    if (pageActions) {
        const pageActions = document.getElementById('page_actions');

        return buttonInProfilesForGroups(pageActions);
    }

    
    const observer = new MutationObserver(mutations => {

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {

                if (!(node instanceof HTMLElement)) {
                    continue;
                }


                if (
                    node.classList.contains('im-mess--check')
                    || node.classList.contains('_sticker_hints')
                    || node.classList.contains('im-page--title')
                ) {
                    const [peerHistory] = document.getElementsByClassName('_im_peer_history');

                    return buttonInMessages(peerHistory);
                }


                if (node.classList.contains('post_field_warning')) {
                    const pageActions = document.getElementById('page_actions');

                    return buttonInProfilesForGroups(pageActions);
                }


                if (node.classList.contains('Profile')) {
                    const [profileHeaderActions] = document.getElementsByClassName('ProfileHeaderButton');

                    return buttonInProfiles(profileHeaderActions);
                }
            }
        }
    });

    observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeChange;