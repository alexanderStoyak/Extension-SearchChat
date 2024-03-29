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

        'showHistoryChat': ({ indexChatOrChat, backFunction, friends }) => {
            const input = document.getElementById('search_users_history');

            (document.getElementById('back_button_modal_page') ?? {}).onclick = () => {
                backFunction({ isCurrent: true });
            };

            if (input) {
                input.oninput = () => {
                    showHistoryChat(indexChatOrChat, backFunction, friends, input.value);
                }
                input.setSelectionRange(input.value.length, input.value.length);
                input.focus();

                document.getElementById('searchChats_button').onclick = () => showHistoryChat(indexChatOrChat, backFunction, friends, input.value);
            }
        },

        'showStatistics': () => {
            (document.getElementById('top_users') ?? {}).onclick = showTopUsers;
            (document.getElementById('top_groups') ?? {}).onclick = showTopGroups;
        },


        'searchChats': ({ offset, friends }) => {
            (document.getElementById('reset_filters') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.remove();
                searchChats({});
            }

            (document.getElementById('next_page_button') ?? {}).onclick = () => {
                if (load.chats) return;
                searchChats({ offset: offset += 15 });
            };

            (document.getElementById('previous_page_button') ?? {}).onclick = () => {
                if (load.chats) return;
                searchChats({ offset: offset -= 15 });
            };

            ([...document.getElementsByClassName('members_chat')]).forEach(
                (button, index) =>
                    button.onclick = () =>
                        showUsersChat(index, friends, searchChats)
            );

            (document.getElementById('filter_only_with_friends') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.onlyWithFriends = !filters.onlyWithFriends;
                searchChats({});
            }

            (document.getElementById('filter_is_history') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.isHistory = !filters.isHistory;
                searchChats({});
            }

            (document.getElementById('filter_is_active') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.isActive = !filters.isActive;
                searchChats({});
            }

            (document.getElementById('filter_is_achive') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.isArchive = !filters.isArchive;
                searchChats({});
            }

            (document.getElementById('filter_set_sort_order') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.sortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
                searchChats({});
            }

            (document.getElementById('filters_clear') ?? {}).onclick = () => {
                if (load.chats) return;
                filters.remove();
                searchChats({});
            }

            const sortField = document.getElementById('sort_field');
            if (sortField) {
                sortField.onclick = () => {
                    if (load.chats) return;
                    if (filters.sortField !== sortField.value) {
                        filters.sortField = sortField.value;
                        searchChats({});
                    }
                }
            }

            (document.getElementById('filter_button_delete_user') ?? {}).onclick = () => {
                if (load.chats) return;
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
                    if (load.chats) return;
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
                    if (load.chats) return;
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
                if (load.chats) return;
                filters.minUsers = rangeUsersMin.value = 0;
                filters.maxUsers = rangeUsersMax.value = 200_000;
                searchChats({});
            }

            (document.getElementById('get_profile') ?? {}).onclick = () => {
                showProfile({ id: filters.link });
            }

            const link = document.getElementById('search_link');
            if (link) {
                link.onclick = () => {
                    filters.link = link.getAttribute('link');
                    filters.title = '';

                    searchChats({});
                }
            }

            function tagsTriggers() {
                for (const tag of document.getElementsByClassName('filter_tags')) {
                    tag.onclick = () => {
                        const _tag = tag.innerHTML;

                        const indexTag = filters.tags.findIndex(__tag => _tag === __tag);

                        if (indexTag === -1) {
                            filters.tags.push(_tag);
                        } else {
                            filters.tags.splice(indexTag, 1);
                        };

                        for (const __tag of document.getElementsByClassName(_tag)) {
                            if (indexTag === -1) {
                                __tag.style.color = appearance.get() === 'dark' ? '#A8E4A0' : '#258b17';
                            } else {
                                __tag.style.color = null;
                            }
                        };
                    }
                }
            }

            tagsTriggers();

            const filterTags = document.getElementById('input_filter_tags');
            if (filterTags) {
                filterTags.oninput = () => {
                    const content = document.getElementById('filter_tags');

                    filters.tagsFilter = filterTags.value;

                    const tags = services.tags.filter(tag => new RegExp(noSpecialCharacters(filters.tagsFilter), 'i').test(tag));

                    if (!tags.length) {
                        content.innerHTML = blankNotFound(icons({ name: 'ghost_simple_outline', size: 86 }), '', undefined, '125px');
                        return;
                    } else {
                        content.innerHTML = services.tags
                            .filter(tag => new RegExp(noSpecialCharacters(filters.tagsFilter), 'i').test(tag)
                            ).map(tag => `
                                <button target="_blank" class="btn" style="gap: 6px; font-weight: 500; align-items: center;">
                                    <div class="filter_tags ${tag}" style="display: flex; text-decoration: none; ${filters.tags.includes(tag) ? `color: ${appearance.get() === 'dark' ? '#A8E4A0' : '#258b17'};` : ''}">${tag}</div>
                                </button>
                            `)
                            .join('');

                        tagsTriggers();
                    }
                };
            }

        },


        'buttonsInTopProfileMenu': () => {
            (document.getElementById('stats') ?? {}).onclick = showStatistics;

            (document.getElementById('add_chat') ?? {}).onclick = showAddChat;

            (document.getElementById('search_chats') ?? {}).onclick = () => searchChats({});

            (document.getElementById('admin_panel') ?? {}).onclick = showAdminPanel;

            (document.getElementById('shop') ?? {}).onclick = showShop;

            (document.getElementById('profile') ?? {}).onclick = () => showProfile({});

            (document.getElementById('remove_token_vk') ?? {}).onclick = async () => {
                await vkAuth();

                const user = services.VKMainUser;

                const nameHTML = `<span style="max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    ${deXSS(user.first_name)} ${deXSS(user.last_name)}
                </span>`;

                const nameString = deXSS(`${user.first_name} ${user.last_name}`);

                notifiers(`
                    <div style="display: flex; gap: 5px; font-weight: 400; color: #99a2ad; align-items: center;">
                        Теперь Вы используйте аккаунт как 
                        <a title="${nameString}" target="_blank" href="https://vk.com/id${user.id}" style="display: flex;">
                            ${nameHTML}
                        </a>

                        <div style="width: 20px; height: 20px;"
                            class="vkuiAvatar vkuiImageBase vkuiImageBase--size-20 vkuiImageBase--loaded" role="img">
                            <img class="vkuiImageBase__img" src="${user.photo_100 || ''}">
                        </div>
                    </div>
                `);
            };
        },


        'showShop': () => {
            (document.getElementById('my_hide') ?? {}).onclick = () => showDescriptionProduct('myHide');
            (document.getElementById('subscription') ?? {}).onclick = () => showDescriptionProduct('subscription');
        },


        'showDescriptionProduct': () => {
            (document.getElementById('back_button_modal_page') ?? {}).onclick = showShop;

            const donuts = document.getElementsByClassName('donate');

            for (const donut of donuts) {
                donut.onclick = () => {
                    const data = JSON.parse(donut.getAttribute('data'));

                    redirectPost('https://yoomoney.ru/quickpay/confirm', {
                        receiver: 4100117442562201,
                        'quickpay-form': 'button',
                        sum: data.sum,
                        label: JSON.stringify({
                            productId: data.productId,
                            userId: services.VKMainUser.id
                        })
                    })
                };
            }
        },


        'error': () => {
            (document.getElementById('restart_page') ?? {}).onclick = () => {
                location.reload();
            }

            (document.getElementById('shop') ?? {}).onclick = () => {
                showShop();
            }

            (document.getElementById('help_chat') ?? {}).onclick = () => {
                window.location.href = services.telegramChatURL;
            }
        },


        'showProfile': ({ id, friends, chat }) => {
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
                        showUsersChat(chat, friends, () => showProfile({ id }))
            );

            ([...document.getElementsByClassName('history_chat')]).forEach(
                button =>
                    button.onclick = () =>
                        showHistoryChat(chat, () => showProfile({ id }), friends)
            );

            const buttonForBan = document.getElementById('set_ban_user');

            if (buttonForBan) {
                buttonForBan.onclick = async () => {
                    const id = buttonForBan.getAttribute('data');
                    let reason = document.getElementById('reason_ban')?.value;

                    if (reason === '') {
                        reason = 'Заблокирован по решению администратора';
                    }

                    const response = await SCAPI.call({
                        method: 'extension.userSetBan',
                        parameters: {
                            userId: +id,
                            reason: reason
                        }
                    });

                    return notifiers(`Аккаунт ID: ${id} ${response.type === 'banned' ? 'заблокирован' : 'разблокирован'}`);
                };
            };

            const buttonForSubscribe = document.getElementById('add_subscription');

            if (buttonForSubscribe) {
                buttonForSubscribe.onclick = async () => {
                    const id = buttonForSubscribe.getAttribute('data');
                    let date = document.getElementById('date_subscription')?.value;

                    if (date === '') {
                        date = +new Date();
                    }

                    date = +new Date(date);

                    const response = await SCAPI.call({
                        method: 'extension.setUserSubscription',
                        parameters: {
                            userId: +id,
                            expired: date
                        }
                    });

                    return notifiers(`Выдана подписка ID: ${id} до ${moment(response.expired).format('DD.MM.YYYY HH:mm')}`);
                };
            };

            for (const searchText of document.getElementsByClassName('profile_copy_text_last_search')) {
                searchText.onclick = () => {
                    const copyText = searchText.innerHTML;
                    navigator.clipboard.writeText(copyText);
                    notifiers('Скопировано!');
                }
            }
        },
    })[fromWhichFunction](args);
}