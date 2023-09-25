const VKAPI = {
    url: 'https://api.vk.com/method',
    call: async function (method = 'users.get', parameters = {}) {
        parameters = {
            access_token: services.access_token,
            v: '5.131',
            ...parameters
        };

        const { response: responseString } = await GM_xmlhttpRequest(`${this.url}/${method}`, parameters);

        const { response, error } = JSON.parse(responseString);

        if (error) {
            notifiers('<span style="color: #FD324A; font-weight: bold;">Error from VK API: </span>' + JSON.stringify(error, null, "<br/>"));
        };


        return response;
    },
    isValid: async function () {
        const [user] = await this.call();

        return user;
    }
};


const SCAPI = {
    url: 'https://api.search-for-chats-of-vk.ru/method',
    call: async function ({ method = 'extension.getUserChats', parameters = {} }) {
        parameters = {
            access_token: services.access_token,
            token: services.SCAPIToken,
            ...parameters
        };

        const { response: { response, error } } = await GM_xmlhttpRequest(`${this.url}/${method}`, parameters);

        if (error) {
            notifiers('<span style="color: #FD324A; font-weight: bold;">Error from SC API: </span>' + JSON.stringify(error, null, "<br/>"));
        }


        return response;

    }
};


async function vkAuth() {
    notifiers('Регистрация учетной записи в расширении ПоискЧата..');

    const { response } = await GM_xmlhttpRequest(services.urlByGetToken);

    const [url, url2] = response.match(/https:\/\/[^"]+\.vk\.com\/[^"]+grant_access[^"]+/g);

    if ((!url && !url2) || url.indexOf('cancel') !== -1) {
        return notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка авторизации ВКонтакте</span>');
    };

    const { finalUrl } = await GM_xmlhttpRequest(url);

    const href = new URL(finalUrl);

    const access_token = href.searchParams.get('authorize_url').split('access_token%3D')[1].split('%26expires_in')[0];

    services.access_token = access_token;

    const user = await VKAPI.isValid();


    if (!user) {
        notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка авторизации ВКонтакте</span>');
        GM_setValue('access_token', '');
        return false;
    };


    GM_setValue('access_token', services.access_token = access_token);
    GM_setValue('VKMainUser', services.VKMainUser = user);
    notifiers(`<span style="color:  #A8E4A0; font-weight: bold;">Авторизованный, VK токен получен (Kate Mobile)\nДобро пожаловать в ПоискЧата, ${user.first_name}!</span>`);

    return true;
}