// ==UserScript==
// @name         ПоискЧата
// @namespace    http://tampermonkey.net/
// @description  Поисковик бесед ВКонтакте в Вашем браузере
// @author       Alexander Stoyak
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

// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/main.js

// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/handlers/buttonInProfiles.js

// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/API.js
// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/blanksHTML.js
// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/request.js
// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/services.js
// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/styles.js
// @require      https://raw.githubusercontent.com/alexanderStoyak/Extension-SearchChat/main/utils/VKFunctions.js

// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @version      1.0.0@alpha
// ==/UserScript==