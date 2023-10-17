const VKAPI = {
    call: async (method = 'users.get', parameters = {}) => {
        parameters = {
            access_token: services.auth.accessToken,
            v: '5.131',
            ...parameters
        };

        let { response: responseString } = await GM_xmlhttpRequest(`https://api.vk.com/method/${method}`, parameters);

        let { response, error } = JSON.parse(responseString);

        if (error) {
            if(error.error_code === 5) {
                await vkAuth();

                let { response: ReResponseString } = await GM_xmlhttpRequest(
                    `https://api.vk.com/method/${method}`,
                    {...parameters, access_token: services.auth.accessToken}
                );

                response = JSON.parse(ReResponseString).response;

            } else {
                console.log(error);
                notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка VK API код №${error.error_code}: </span>' + error.error_message);
            }
        };

        return response;
    },
    isValid: async function () {
        const [user] = await this.call();

        return user;
    }
};


const SCAPI = {
    call: async ({ method = 'extension.getChats', parameters = {} }) => {
        parameters = {
            access_token: services.auth.accessToken,
            token: services.SCAPIToken,
            ...parameters
        };

        const { response: { response, error } } = await GM_xmlhttpRequest(`https://api.search-for-chats-of-vk.ru/method/${method}`, parameters);

        if (error) {
            console.log(error);
            notifiers('<span style="color: #FD324A; font-weight: bold;">Error from SC API: </span>' + JSON.stringify(error, null, "<br/>"));
        };


        return response;
    }
};


async function vkAuth() {
    const { response: Html } = await GM_xmlhttpRequest(services.auth.urlByGetCode);

    const urlGetByCode = Html.match(/location\.href = "(.*)"/i)[1];

    const { finalUrl } = await GM_xmlhttpRequest(urlGetByCode);

    const code = finalUrl.match(/https:\/\/oauth.vk.com\/blank.html#code=(.*)/)[1];

    const { response } = await GM_xmlhttpRequest(services.auth.urlByGetToken + `&code=${code}`);

    const auth = JSON.parse(response);

    if (!auth.access_token) {
        return notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка при авторизации ВКонтакте</span>');
    }

    services.auth.accessToken = auth.access_token;

    const user = await VKAPI.isValid();

    if (!user) {
        notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка при авторизации ВКонтакте</span>');
        GM_setValue('accessToken', '');
        return false;
    };


    GM_setValue('accessToken', services.auth.accessToken = auth.access_token);
    GM_setValue('expiresIn', services.auth.expiresIn = +new Date + auth.expires_in * 1_000 );
    GM_setValue('VKMainUser', services.VKMainUser = user);

    return true;
}