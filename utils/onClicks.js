function onClicks (fromWhichFunction, args) {
    ({
        'showUsersChat': ({indexChat, friends, backFunction, offset}) => {
            const input = document.getElementById('search_users_chat');

            (document.getElementById('next_page_button') ?? {}).onclick = () => {
                showUsersChat(indexChat, friends, backFunction, offset + 50, input?.value);
            };

            (document.getElementById('previous_page_button') ?? {}).onclick = () => {
                showUsersChat(indexChat, friends, backFunction, offset - 50, input?.value);
            };

            (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
                backFunction({ isCurrent: true });
            };

            if (input) {
                input.oninput = () => {
                    showUsersChat(indexChat, friends, backFunction, offset, input.value);
                }
                input.setSelectionRange(input.value.length, input.value.length);
                input.focus();

                document.getElementById('searchChats_button').onclick = () => searchChats({});
            }
        },


        'showStatistics': () => {
            (document.getElementById('top_users') ?? {}).onclick = showTopUsers;
            (document.getElementById('top_groups') ?? {}).onclick = showTopGroups;
        },


        'searchChats': ({offset, friends}) => {
            (document.getElementById('reset_filters') ?? {}).onclick = () => {
                filters.remove();
                searchChats({});
            }

            (document.getElementById('next_page_button') ?? {}).onclick = () => {
                searchChats({ offset: offset += 15 });
            };

            (document.getElementById('previous_page_button') ?? {}).onclick = () => {
                searchChats({ offset: offset -= 15 });
            };

            ([...document.getElementsByClassName('members_chat')]).forEach(
                (button, index) =>
                    button.onclick = () =>
                        showUsersChat(index, friends, searchChats)
            );

            (document.getElementById('filter_only_with_friends') ?? {}).onclick = () => {
                filters.onlyWithFriends = !filters.onlyWithFriends;
                searchChats({});
            }

            (document.getElementById('filter_set_sort_order') ?? {}).onclick = () => {
                filters.sortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
                searchChats({});
            }

            const sortField = document.getElementById('sort_field');
            if (sortField) {
                sortField.onclick = () => {
                    if (filters.sortField !== sortField.value) {
                        filters.sortField = sortField.value;
                        searchChats({});
                    }
                }
            }

            (document.getElementById('filter_button_delete_user') ?? {}).onclick = () => {
                filters.link = '';
                searchChats({});
            }

            for (const link of document.getElementsByClassName('copy_link_for_chat')) {
                link.onclick = () => {
                    const copyText = link.getAttribute('link');
                    navigator.clipboard.writeText(copyText);
                    notifiers(`Ссылка на чат скопирована <a href="${copyText}" target="_blank">${copyText}</a>`);
                }
            }

            const input = document.getElementById('searchChats_input');

            if (input) {
                let timeOut;
                input.oninput = () => {
                    filters.title = input.value;
                    if (timeOut) {
                        clearTimeout(timeOut);
                    }

                    timeOut = setTimeout(() => {
                        searchChats({});
                    }, 500);
                }
                input.setSelectionRange(input.value.length, input.value.length);
                input.focus();

                document.getElementById('searchChats_button').onclick = () => searchChats({});
            }
        },


        'buttonsInTopProfileMenu': () => {
            (document.getElementById('stats') ?? {}).onclick = showStatistics;

            (document.getElementById('add_chat') ?? {}).onclick = showAddChat;

            (document.getElementById('search_chats') ?? {}).onclick = () => searchChats({});
            
            (document.getElementById('admin_panel') ?? {}).onclick = showAdminPanel;

            (document.getElementById('shop') ?? {}).onclick = showShop;
        },


        'showShop': () => {
            (document.getElementById('my_hide') ?? {}).onclick = () => showDescriptionProduct('myHide');
            (document.getElementById('subscription') ?? {}).onclick = () => showDescriptionProduct('subscription');
        },

        
        'showDescriptionProduct': () => {
            (document.getElementById('back_button_modal_page') ?? {}).onclick = showShop;
        },

        
        'warn': () => {
            (document.getElementById('restart_page') ?? {}).onclick = () => {
                location.reload();
            }
        
            (document.getElementById('shop') ?? {}).onclick = () => {
                showShop();
            }
        }
    })[fromWhichFunction](args);
}