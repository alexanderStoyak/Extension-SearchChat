const hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
const errors = {
    18: {
        title: 'У Вас включен один или несколько платных фильтров, которые требуют подписку',
        button: {
            id: 'shop',
            text: 'В магазин',
        },
    },
    25: {
        title: 'Аккаунт заблокирован',
        button: undefined
    },
    19: {
        title: 'Ошибка доступа',
        button: undefined
    }
};


const VKAPI = {
    call: async (method = 'users.get', parameters = {}) => {
        parameters = {
            access_token: services.auth.accessToken,
            v: '5.131',
            ...parameters
        };

        const parametersHashCode = String(hashCode(JSON.stringify(parameters) + method));

        const cache = APICache.get(parametersHashCode);

        if (cache) {
            return cache;
        }

        let { response: responseString } = await GM_xmlhttpRequest(`https://api.vk.com/method/${method}`, parameters);

        let { response, error } = JSON.parse(responseString);

        if (error) {
            if (error.error_code === 5) {
                await vkAuth();

                let { response: responseString } = await GM_xmlhttpRequest(
                    `https://api.vk.com/method/${method}`,
                    { ...parameters, access_token: services.auth.accessToken }
                );

                response = JSON.parse(responseString).response;

            } else {
                console.log(error);
                notifiers(`<span style="color: #FD324A; font-weight: bold;">Ошибка VK API код №${error.error_code}: </span>` + error.error_msg);
            }
        };

        APICache.set({
            key: parametersHashCode,
            data: response,
            expired: +new Date + 60_000
        });

        return response;
    },
    isValid: async function () {
        const [user] = await this.call('users.get', { fields: 'photo_100' });

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

        const parametersHashCode = String(hashCode(JSON.stringify(parameters) + method));

        const cache = APICache.get(parametersHashCode);

        if (cache) {
            return cache;
        }

        const { response: { response, error } } = await GM_xmlhttpRequest(`https://api.search-for-chats-of-vk.ru/method/${method}`, parameters);

        if (error) {
            return errorAPI(error)
        };

        APICache.set({
            key: parametersHashCode,
            data: response,
            expired: +new Date + 60_000
        });

        return response;
    }
};


async function vkAuth() {
    const { response: html } = await GM_xmlhttpRequest(services.auth.urlByGetCode);

    const urlGetByCode = html.match(/location\.href = "(.*)"/i)[1];

    const { finalUrl } = await GM_xmlhttpRequest(urlGetByCode);

    const code = finalUrl.match(/https:\/\/oauth.vk.com\/blank.html#code=(.*)/)[1];

    const { response } = await GM_xmlhttpRequest(services.auth.urlByGetToken + `&code=${code}`);

    const auth = JSON.parse(response);

    if (!auth.access_token) {
        return false;
    }

    services.auth.accessToken = auth.access_token;

    const user = await VKAPI.isValid();

    if (!user) {
        notifiers('<span style="color: #FD324A; font-weight: bold;">Ошибка при авторизации ВКонтакте</span>');
        GM_setValue('accessToken', '');
        return false;
    };


    GM_setValue('accessToken', services.auth.accessToken = auth.access_token);
    GM_setValue('expiresIn', services.auth.expiresIn = +new Date + auth.expires_in * 1_000);
    GM_setValue('VKMainUser', services.VKMainUser = user);

    return true;
}


function errorAPI(_error) {

    if (!(_error.code in errors)) {
        console.log(_error);
        notifiers(`<span style="color: #FD324A; font-weight: bold;">Ошибка API ПоискЧата </span> код №${_error.code}: ${_error.message}`);
    }

    const error = errors[_error.code] ?? {
        title: 'Что-то пошло не так..',
        button: {
            id: 'restart_page',
            text: 'Перезагрузить страницу'
        }
    };

    modalPage.setContent(
        blankNotFound(
            icons({ name: 'privacy_outline', realSize: 28, size: 86 }),
            error.title,
            error.button
        )
    )

    onClicks('error', {});

    return { 
        accessDenied: true 
    }
}