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


const newModalPage = title => new MessageBox({
    title: title,
    width: 550,
    hideButtons: true,
    bodyStyle: 'padding: 5px;'
});

class ModalPage {
    constructor(title = {}) {}

    new(title = titleModalPage({})) {
        if (!this.modalPage || !this.modalPage.isVisible()) {
            this.modalPage = newModalPage(title);

            this.boxBody = [...document.getElementsByClassName('box_body')].at(-1);
            this.boxTitle = [...document.getElementsByClassName('box_title')].at(-1);
            this.modalPageTitle = [...document.getElementsByClassName('box_title_wrap')].at(-1);
            this.boxLayout = [...document.getElementsByClassName('box_layout')].at(-1);
            this.boxLayer = document.getElementById('box_layer');
            this.boxLayerWrap = document.getElementById('box_layer_wrap');

            this.boxTitle.style.height = 'auto';
            this.boxTitle.style.lineHeight = '20px';
            this.boxTitle.style.padding = '5px';
            this.boxTitle.style.overflow = 'visible';

            this.functionsForScroll = {};
        } else {
            this.setTitle(title);
        }

        return this;
    }

    visible() {
        this.modalPage.show();


        this.fixedTitle();

        return this;
    }

    setContent(html) {
        if(this.modalPage.isVisible()) {
            this.boxBody.innerHTML = html;
            this.fixedTitle();
        } else {
            this.modalPage.content(html);
        }

        return this;
    }

    setTitle(html) {
        if(this.modalPage.isVisible()) {
            this.boxTitle.innerHTML = html;
        }

        return this;
    }

    fixedTitle() {
        this.scroll('fixedTitle', () => {
            const offset = this.modalPageTitle.offsetHeight + this.boxLayer.offsetHeight - this.boxLayout.offsetHeight - 80;
            if (this.modalPageTitle.getBoundingClientRect().top < 0 && !this.modalPageTitle.classList.contains('ui_tabs_fixed')) {
                this.modalPageTitle.style.width = '550px';
                this.modalPageTitle.style.borderRadius = '0px';
                this.boxBody.style.marginTop = `${offset}px`;
                this.modalPageTitle.classList.add('ui_tabs_fixed');
            } else if (this.boxBody.getBoundingClientRect().top >= this.modalPageTitle.offsetHeight) {
                this.boxBody.style.marginTop = '0px';
                this.modalPageTitle.style.borderRadius = '10px 10px 0px 0px';
                this.modalPageTitle.classList.remove('ui_tabs_fixed');
            }
        });

        return this;
    }

    scroll(type, func) {
        this.functionsForScroll[type] = func;
        this.boxLayerWrap.onscroll = () => {
            for (const type in this.functionsForScroll) {
                this.functionsForScroll[type]();
            }
        }

        return this;
    }

    setLoad(titles = []) {
        this.setContent(`
            <div class="spinner" style="padding: 100px;"> 
                <span class="spinner__animation"></span>
                ${Array.isArray(titles) && titles.length ? `<span id="spinner_info" class="spinner__info">${pick(titles)}</span>` : ''}
            </div>
        `);

        const updateTitleLoad = setInterval(() => {
            const spanLoad = document.getElementById('spinner_info');
            if (!spanLoad) {
                return clearInterval(updateTitleLoad);
            } else {
                spanLoad.innerHTML = pick(titles);
            }
        }, 1_000);

        return this;
    }
}
let modalPage;