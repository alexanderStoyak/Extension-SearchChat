const observeChange = async () => {

    if (!services.access_token) {
        const response = await vkAuth();

        if(!response) {
            return;
        }
    };

    const body = document.querySelector("body");

    const profileHeaderActions = document.getElementsByClassName('ProfileHeaderButton');
    if (profileHeaderActions.length) {
        buttonInProfiles(profileHeaderActions);
    };

    const observer = new MutationObserver(mutations => {

        for (const mutation of mutations) {

            for (const node of mutation.addedNodes) {

                if (!(node instanceof HTMLElement)) {
                    continue;
                }


                if(node.classList.contains('im-mess--check') || node.classList.contains('_sticker_hints')) {
                    const message = document.querySelector('._im_peer_history');

                    return buttonInMessages(message);
                };

                if (node.classList.contains('Profile')) {
                    const profileHeaderActions = document.getElementsByClassName('ProfileHeaderButton');

                    return buttonInProfiles(profileHeaderActions);
                };


            };
        };
    });

    observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeChange;