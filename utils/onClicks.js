function onClicks(fromWhichFunction, args) {
    ({
        'showUsersChat': ({ indexChatOrChat, friends, backFunction, offset }) => {
            const input = document.getElementById('search_users_chat');

            (document.getElementById('next_page_button') ?? {}).onclick = () => {
                showUsersChat(indexChatOrChat, friends, backFunction, offset + 50, input?.value);
            };

            (document.getElementById('previous_page_button') ?? {}).onclick = () => {
                showUsersChat(indexChatOrChat, friends, backFunction, offset - 50, input?.value);
            };

            (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
                backFunction({ isCurrent: true });
            };

            if (input) {
                input.oninput = () => {
                    showUsersChat(indexChatOrChat, friends, backFunction, offset, input.value);
                }
                input.setSelectionRange(input.value.length, input.value.length);
                input.focus();

                document.getElementById('searchChats_button').onclick = () => searchChats({});
            }
        },

        'showHistoryChat': ({backFunction}) => {
            (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
                backFunction({ isCurrent: true });
            };
        },

        'showStatistics': () => {
            (document.getElementById('top_users') ?? {}).onclick = showTopUsers;
            (document.getElementById('top_groups') ?? {}).onclick = showTopGroups;
        },


        'searchChats': ({ offset, friends }) => {
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

            (document.getElementById('filter_is_history') ?? {}).onclick = () => {
                filters.isHistory = !filters.isHistory;
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

            ([...document.getElementsByClassName('history_chat')]).forEach(
                (button, index) =>
                    button.onclick = () =>
                        showHistoryChat(index, searchChats, friends)
            );

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

            const rangeUsersMin = document.getElementById('range_users_input_min');
            const rangeUsersMax = document.getElementById('range_users_input_max');

            if (rangeUsersMin) {
                rangeUsersMin.oninput = () => {
                    let value = +rangeUsersMin.value || +(rangeUsersMin.value = 0);

                    if (value > 199998) {
                        value = 199998;
                    } else if (value < 0) {
                        value = 0;
                    }

                    [filters.minUsers, rangeUsersMin.value] = [value, value];

                    if (filters.maxUsers <= filters.minUsers) {
                        rangeUsersMax.value = +(filters.maxUsers = filters.minUsers + 1);
                        rangeUsersMax.style.width = `${((String(rangeUsersMax.value).length + 1) * 8) - 8}px`;
                    }

                    rangeUsersMin.style.width = `${((String(rangeUsersMin.value).length + 1) * 8) - 8}px`;
                }
            }

            if (rangeUsersMax) {
                rangeUsersMax.oninput = () => {
                    let value = +rangeUsersMax.value || +(rangeUsersMax.value = 0);
                    if (value > 200_000) {
                        value = 200_000;
                    } else if (value < 1) {
                        value = 1;
                    }

                    [filters.maxUsers, rangeUsersMax.value] = [value, value];
                    
                    if (filters.minUsers >= filters.maxUsers) {
                        const value = +(filters.minUsers = filters.maxUsers - 1);
                        rangeUsersMin.value = value < 0 ? 1 : value;
                        rangeUsersMin.style.width = `${((String(rangeUsersMin.value).length + 1) * 8) - 8}px`;
                    }

                    rangeUsersMax.style.width = `${((String(rangeUsersMax.value).length + 1) * 8) - 8}px`;
                }
            }


            (document.getElementById('clear_range_users') ?? {}).onclick = () => {
                filters.minUsers = rangeUsersMin.value = 0;
                filters.maxUsers = rangeUsersMax.value = 200_000;
                searchChats({});
            }

            (document.getElementById('get_profile') ?? {}).onclick = () => {
                showProfile({ id: filters.link });
            }
        },


        'buttonsInTopProfileMenu': () => {
            (document.getElementById('stats') ?? {}).onclick = showStatistics;

            (document.getElementById('add_chat') ?? {}).onclick = showAddChat;

            (document.getElementById('search_chats') ?? {}).onclick = () => searchChats({});

            (document.getElementById('admin_panel') ?? {}).onclick = showAdminPanel;

            (document.getElementById('shop') ?? {}).onclick = showShop;

            (document.getElementById('profile') ?? {}).onclick = () => showProfile({});
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
        },


        'showProfile': ({ id, friends, chat}) => {
            const input = document.getElementById('search_user_profile');

            if (input) {
                input.setSelectionRange(input.value.length, input.value.length);
                input.focus();

                document.getElementById('searchChats_button').onclick = () => showProfile({ id: input.value });
            }

            (document.getElementById('full_chats_from_profile') ?? {}).onclick = () => {
                filters.link = id;
                searchChats({ isCurrent: false });
            };

            ([...document.getElementsByClassName('members_chat')]).forEach(
                button =>
                    button.onclick = () =>
                        showUsersChat(chat, friends, showProfile)
            );

            ([...document.getElementsByClassName('history_chat')]).forEach(
                button =>
                    button.onclick = () =>
                        showHistoryChat(chat, showProfile, friends)
            );
        },
    })[fromWhichFunction](args);
}