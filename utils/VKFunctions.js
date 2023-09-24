let modalPage = 0;
function newModalPage(title) {
    if (!modalPage || !modalPage.isVisible()) {
        modalPage = new MessageBox({
            title,
            width: 500,
            hideButtons: true,
            bodyStyle: 'padding: 5px;'
        });
    }

    return modalPage;
};


function notifiers(text, title = 'ПоискЧата') {
    Notifier.showEvent({ title, text });
};


async function getUsersOrGroups(links) {
    const sreensNames = links.map(link => {
        let idOrSreenName = `${link.toString().replace(/vk\.ru\/|vk\.com\/|https:\/\/|http:\/\//g, '')}`;

        if (idOrSreenName < 0) {
            idOrSreenName = {
                type: 'club',
                id: -idOrSreenName
            };
        } else if (idOrSreenName > 0) {
            idOrSreenName = {
                type: 'user',
                id: idOrSreenName
            };
        } else {
            idOrSreenName = {
                type: 'undefined',
                id: idOrSreenName
            };
        };

        return idOrSreenName;
    });

    const code = `
        var sreensNames = ${JSON.stringify(sreensNames)};
        var i = 0;
        var returns = [];

        while(i < sreensNames.length) {
            var info = sreensNames[i];

            if(info.type == "club") {
                returns.push(API.groups.getById({ group_id: info.id })[0]);
            };

            if(info.type == "user") {
                returns.push(API.users.get({ user_id: info.id })[0]);
            };

            if(info.type == "undefined") {
                var obj = API.groups.getById({ group_id: info.id })[0];
                if(obj == null) {
                    obj = API.users.get({ user_id: info.id })[0];
                };

                returns.push(obj);
            };

            i = i + 1;
        };
        return returns;
    `;

    const response = await VKAPI.call('execute', { code });

    return response;
}


function decOfNum(number, words) {
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
}