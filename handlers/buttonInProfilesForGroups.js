function buttonInProfilesForGroups(pageActions) {
    const newButton = document.createElement('a');

    newButton.className = 'FlatButton FlatButton--secondary FlatButton--size-m redesigned-group-action';

    newButton.onclick = () => userOrGropChats(window.location.href, 0);

    newButton.innerHTML = `
         <span class="FlatButton__in">
            <span class="FlatButton__content" style="font-weight: 500;">
                Чаты
            </span>
        </span>
    `;

    pageActions.insertBefore(newButton, pageActions.firstChild);
}