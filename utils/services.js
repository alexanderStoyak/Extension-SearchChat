const services = {
    VKMainUser: GM_getValue('VKMainUser'),
    SCAPIToken: 'sefoch.extension.V1',
    auth: {
        accessToken: GM_getValue('accessToken'),
        urlByGetCode: 'https://oauth.vk.com/authorize?client_id=51408389&redirect_uri=https://oauth.vk.com/blank.html&display=page&response_type=code&scope=2&revoke=1',
        urlByGetToken: 'https://oauth.vk.com/access_token?client_id=51408389&client_secret=suYuXAtHfCWxbLYoUuV8&scope=2&redirect_uri=https://oauth.vk.com/blank.html&display=page',
    },
    mainGroup: {
        id: 222444978
    },
    timeStampAuthModalPage: GM_getValue('timeStampAuthModalPage'),
    telegramChannelURL: 'https://t.me/search_chats_for_VK',
    telegramChatURL: 'https://t.me/chatsvkbot_chat',
    userAgreement: 'https://telegra.ph/Pravila-polzovaniya-bota-API-i-rasshireniya-PoiskCHata-03-03',
    github: {
        userScriptLink: 'https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/searchChats.user.js'
    },
    v: '6.2.0',
    pick: {
        searchChats: [
            "Сортируем...",
            "Ищем...",
            "Чаты уже в пути!",
            "Один момент...",
            "Загружаем...",
            "Подгружаем...",
            "Грузим...",
            "Просматриваем...",
            "Обрабатываем...",
            "Анализируем...",
            "Оцениваем...",
            "Фильтруем...",
            "Находим...",
            "Подбираем...",
            "Проверяем...",
            "Собираем...",
            "Изучаем...",
            "Получаем...",
            "Готовим...",
            "Сверяем...",
            "Просчитываем...",
            "Производим поиск...",
            "Подготавливаем результаты...",
            "Ожидайте...",
            "Считываем...",
            "Получаем данные...",
            "Сканируем...",
            "Отображаем...",
            "Запрашиваем...",
            "Подготавливаем список...",
            "Подгружаем информацию...",
            "Проверяем соответствие...",
            "Подстраиваемся под Ваши предпочтения...",
            "Анализируем данные...",
            "Подстраиваемся под Ваш запрос...",
            "Сверяем информацию...",
            "Оптимизируем результаты...",
            "Подбираем лучшие варианты...",
            "Подгружаем дополнительные данные...",
            "Итерируемся по результатам...",
            "Фильтруем по параметрам...",
            "Группируем результаты...",
            "Оптимизируем поиск...",
            "Сверяем с Вашими настройками...",
            "Подгружаем дополнительные ресурсы...",
            "Подгружаем информацию о пользователях...",
            "Сканируем доступные чаты...",
            "Считываем информацию...",
            "Анализируем предпочтения...",
            "Определяем релевантность...",
            "Подгружаем дополнительные фильтры...",
            "Сверяем с Вашими контактами...",
            "Оптимизируем поиск по времени...",
            "Анализируем активность пользователей...",
            "Подгружаем дополнительные опции...",
            "Проверяем наличие обновлений...",
            "Сверяем с Вашими настройками безопасности...",
            "Определяем наиболее актуальные результаты...",
            "Подстраиваемся под Вашу сеть...",
            "Фильтруем по дате создания...",
            "Подгружаем дополнительные параметры...",
            "Считываем информацию о чате...",
            "Анализируем активность друзей...",
            "Определяем наиболее популярные чаты...",
            "Подгружаем дополнительные настройки...",
            "Определяем наиболее подходящие результаты...",
            "Подгружаем дополнительные детали...",
            "Считываем информацию о участниках...",
        ],
        showUsersChat: [
            "Получаем участников из ВКонтакте...",
            "Ищем участников...",
            "Участники уже в пути!",
            "Один момент...",
            "Загружаем участников...",
            "Подгружаем участников...",
            "Грузим участников...",
            "Просматриваем участников...",
            "Обрабатываем участников...",
            "Анализируем участников...",
            "Оцениваем участников...",
            "Фильтруем участников...",
            "Находим участников...",
            "Подбираем участников...",
            "Проверяем участников...",
            "Собираем участников...",
            "Изучаем участников...",
            "Получаем участников...",
            "Готовим участников...",
            "Сверяем участников...",
            "Просчитываем участников...",
            "Производим поиск участников...",
            "Подготавливаем результаты участников...",
            "Ожидайте...",
            "Считываем участников...",
            "Получаем данные участников...",
            "Сканируем участников...",
            "Запрашиваем участников...",
            "Подготавливаем список участников...",
            "Подгружаем информацию об участниках...",
            "Проверяем соответствие участников...",
            "Подстраиваемся под ваши предпочтения участников...",
            "Анализируем данные участников..."
        ]
    }
};