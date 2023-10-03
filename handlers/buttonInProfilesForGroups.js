function buttonInProfilesForGroups(pageActions) {
    if(pageActions.innerHTML.includes('id="buttonInProfilesForGroups"')) {
        return
    }

    const newButton = document.createElement('a');

    newButton.className = 'FlatButton FlatButton--secondary FlatButton--size-m redesigned-group-action';

    newButton.onclick = () => userOrGropChats(window.location.href, 0);

    newButton.innerHTML = `
         <span id="buttonInProfilesForGroups" class="FlatButton__in" title="Чаты группы">
            <span class="FlatButton__content" style="font-weight: 500;">
                ${icons({name: 'chats_outline', realSize: 28, fill: appearance === 'dark' ? 'white' : 'textAccentThemed', size: 20})}
            </span>
        </span>
    `;

    pageActions.insertBefore(newButton, pageActions.firstChild);
}