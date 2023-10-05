const services = {
    VKMainUser: GM_getValue('VKMainUser'),
    SCAPIToken: 'sefoch.extension.V1',
    auth: {
        expiresIn: GM_getValue('expiresIn'),
        accessToken: GM_getValue('accessToken'),
        urlByGetCode: 'https://oauth.vk.com/authorize?client_id=51408389&redirect_uri=https://oauth.vk.com/blank.html&display=page&response_type=code&scope=2&revoke=1',
        urlByGetToken: 'https://oauth.vk.com/access_token?client_id=51408389&client_secret=suYuXAtHfCWxbLYoUuV8&scope=2&redirect_uri=https://oauth.vk.com/blank.html&display=page',
    },
    mainGroup: {
        id: 222444978
    },
    timeStampAuthModalPage: GM_getValue('timeStampAuthModalPage'),
    telegramChannelURL: 'https://t.me/search_chats_for_VK'
};