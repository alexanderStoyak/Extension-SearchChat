class Filters {

    constructor() {
        this.title = '';
        this.link = '';
        this.onlyWithFriends =  false;
        this.sortField = 'added';
        this.sortOrder = 'desc';
    }

    remove () {
        this.title = '';
        this.link = '';
        this.onlyWithFriends =  false;
        this.sortField = 'added';
        this.sortOrder = 'desc';
    }
}
const filters = new Filters();


class Appearance {

    constructor() {
        this.appearance = 'dark';
    }

    update(body) {
        if (body.className.includes('vkui--vkBase--dark')) {
            this.appearance = 'dark';
            setStyles();
        }
        if (body.className.includes('vkui--vkBase--light')) {
            this.appearance = 'light';
            setStyles();
        }
    }

    get() {
        return this.appearance;
    }
}
const appearance = new Appearance();


class Cache {

    constructor() {
        this.data = {};
    }

    get(key) {
        this.checkExpired(key);

        return this.data[key]?.data;
    }

    set({key, data, expired}) {
        this.checkExpired(key);

        if (!this.data[key]) {
            this.data[key] = {};
        }

        this.data[key].expired = expired;
        return this.data[key].data = data;
    }

    delete(key) {
        return delete this.data[key];
    }

    checkExpired(key) {
        if (this.data[key]?.expired < +new Date) {
            this.delete(key);
        }
    }
}
const APICache = new Cache();


class BoxLayerWrapScroll {
    constructor() {
        this.functions = {};
    }

    set(type, func) {
        this.functions[type] = func;
        this.start();

        return this;
    }

    start() {
        (document.getElementById('box_layer_wrap') ?? {}).onscroll = () => {
            for (const type in this.functions) {
                this.functions[type]();
            }
        }

        return this;
    }
}
const boxLayerWrapScroll = new BoxLayerWrapScroll();