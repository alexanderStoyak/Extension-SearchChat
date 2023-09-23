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

                if (node.classList.contains('Profile')) {
                    const profileHeaderActions = document.getElementsByClassName('ProfileHeaderButton');

                    buttonInProfiles(profileHeaderActions);
                }
            }
        }
    });

    observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeChange;