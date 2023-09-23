let xhr = GM_xmlhttpRequest;
GM_xmlhttpRequest = function (url, data = false) {
    let object = {
        method: 'POST',
    };

    if (url.includes('vk.com')) {
        const formData = new FormData();

        for (const key in data) {
            formData.append(key, data[key]);
        };

        object.data = formData;
    } else {
        object = {
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'json',
            ...object
        };
    };

    return new Promise(resolve =>
        xhr({
            url,
            onload: function (request) {
                resolve(request);
                return;
            },
            ...object
        })
    );
};