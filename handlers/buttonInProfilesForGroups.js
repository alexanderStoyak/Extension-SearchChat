function buttonInProfilesForGroups(pageActions) {
    if(pageActions.innerHTML.includes('id="buttonInProfilesForGroups"')) {
        return
    }

    const newButton = document.createElement('a');

    newButton.className = 'FlatButton FlatButton--secondary FlatButton--size-m redesigned-group-action';

    newButton.onclick = () => searchChats(filters.link = window.location.href);

    newButton.innerHTML = `
         <span id="buttonInProfilesForGroups" class="FlatButton__in" title="Чаты группы">
            <span class="FlatButton__content">
                ${icons({name: 'search_stars_outline', realSize: 24, fill: appearance.get() === 'dark' ? 'white' : 'textAccentThemed', size: 20})}
            </span>
        </span>
    `;

    pageActions.insertBefore(newButton, pageActions.firstChild);
}