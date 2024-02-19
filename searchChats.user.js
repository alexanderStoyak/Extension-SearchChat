// ==UserScript==
// @name         ПоискЧата
// @namespace    http://tampermonkey.net/
// @description  Поисковик бесед ВКонтакте в Вашем браузере
// @author       Alexander Stoyak
// @license      MIT
// @icon         file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/icons/logo.png
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

// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/classes.js

// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/main.js

// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/icons.js

// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/handlers/buttonInProfiles.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/handlers/buttonInMessages.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/handlers/buttonInProfilesForGroups.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/handlers/buttonInDialogsSearch.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/handlers/buttonsInTopProfileMenu.js

// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/blanksHTML.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/request.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/services.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/styles.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/functions.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/API.js
// @require      file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/utils/onClicks.js

// @require      https://momentjs.com/downloads/moment-with-locales.js

// @run-at       document-start

// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest

// @updateURL    file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/searchChats.user.js
// @downloadURL  file://C:/Users/sasha/OneDrive/Документы/Extension-SearchChat/searchChats.user.js

// @version      5.5.15

// ==/UserScript==