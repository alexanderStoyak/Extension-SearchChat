function newModalPage(title) {
    const modalPage = new MessageBox({
        title,
        width: 560,
        hideButtons: true,
        bodyStyle: 'padding: 20px;'
    });

    return modalPage;
};


function notifiers(text, title = 'ПоискЧата') {
    Notifier.showEvent({ title, text });
};


async function getUserOrGroupId(link) {
    const sreen_name = link.toString().replace(/vk\.ru\/|vk\.com\/|https:\/\/|http:\/\//g, '');

    const code = `
        var user = API.users.get({user_id: "${sreen_name}" })[0];

        if(user == null) {
            return API.groups.getById({group_id: "${typeof Number(sreen_name) === 'number' && !isNaN(Number(sreen_name)) ? -sreen_name : sreen_name}" })[0];
        };

        user.type = "user";
        return user;
    `;

    const response = await VKAPI.call('execute', { code });

    return response;
}