function buttonInDialogsSearch(dialogsSearch) {
    if (!dialogsSearch.value) {
        document.getElementById('searchChats')?.remove();
    }

    dialogsSearch.oninput = () =>  {

        const oldButton = document.getElementById('searchChats');

        if(dialogsSearch.value.length > 0 && !oldButton) {
            const search = document.getElementById('im_dialogs');
            const newButton = document.createElement('li');
            newButton.id = "searchChats";
            newButton.className = 'im-page--mess-search-w';
            newButton.style = "list-style-type: none;";

            newButton.innerHTML = `
                <div id="buttonSearchChats" class="im-page--mess-search _im_mess_search">
                    <button type="button" class="im-i--messages-search"></button>
                    Искать в «ПоискЧата»
                </div>
            `;

            search.before(newButton);

            const button = document.getElementById('buttonSearchChats');

            button.onclick = () => {
                if(dialogsSearch.value) {
                    searchChats(filters.title = dialogsSearch.value);
                }
            }


        } else if(oldButton && !dialogsSearch.value) {
            oldButton.remove();
        }

        dialogsSearch.onfocus = () => {
            if(dialogsSearch.value.length === 0 && oldButton) {
                oldButton.remove();
            }
        }
    };
}