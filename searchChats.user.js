// ==UserScript==
// @name         ПоискЧата
// @namespace    http://tampermonkey.net/
// @description  Поисковик бесед ВКонтакте в Вашем браузере
// @author       Alexander Stoyak
// @license      MIT
// @icon         https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/icons/logo.png
// @match        https://vk.com/*

// @connect      vk.com
// @connect      vk-cdn.com
// @connect      vk-cdn.net
// @connect      userapi.com
// @connect      cdnjs.cloudflare.com
// @connect      login.vk.com
// @connect      oauth.vk.com
// @connect      api.vk.com
// @connect      api.search-for-chats-of-vk.ru
// @connect      momentjs.com

// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/classes.js

// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/main.js

// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/icons.js

// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/handlers/buttonInProfiles.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/handlers/buttonInMessages.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/handlers/buttonInProfilesForGroups.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/handlers/buttonInDialogsSearch.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/handlers/buttonsInTopProfileMenu.js

// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/blanksHTML.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/request.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/services.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/styles.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/functions.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/API.js
// @require      https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/utils/onClicks.js

// @require      https://momentjs.com/downloads/moment-with-locales.js

// @run-at       document-start

// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest

// @updateURL    https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/searchChats.user.js
// @downloadURL  https://github.com/alexanderStoyak/Extension-SearchChat/raw/main/searchChats.user.js

// @version      6.2.0

// ==/UserScript==