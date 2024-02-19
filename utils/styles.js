const classGroup = 'vkuiInternalGroup vkuiGroup vkuiGroup--mode-card vkuiInternalGroup--mode-card vkuiGroup--padding-m Group-module__group--lRMIn Group-module__groupPaddingM--qj3wo Group-module__groupModeCard--bGIrq vkuiInternalGroupCard';

function setStyles () {
GM_addStyle(`
    #raw {
        display: flex; 
        jostify-content: center;
        align-items: center;
        gap: 20px; 
        padding: 0px;
    }
    
    #cell {
        display: table-cell;
        max-width: 100%;
    }

    .spinner {
        text-align: center;
    }
    
    .spinner__animation {
        display: inline-block;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        border-top: 3px solid rgba(0, 0, 0, 0.1);
        border-right: 3px solid rgba(0, 0, 0, 0.1);
        border-bottom: 3px solid rgba(0, 0, 0, 0.1);
        border-left: 3px solid rgb(129, 138, 145);
        animation: loading-spinner 1s infinite linear;
    }
    
    .spinner__info {
        display: block;
        padding-top: 5px;
        color: rgb(129, 138, 145);
        font-size: .9rem;
    }
    
    @keyframes loading-spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .separator {
        line-height: 1em;
        position: relative;
        outline: 0;
        border: 0;
        color: ${appearance.get() === 'dark' ? 'black' : '#ffffff;'};
        text-align: center;
        height: 1.5em;
        opacity: .5;
    }
    
    .separator:before {
        content: '';
        background: var(--vkui--color_separator_primary);
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 2px;
    }
    
    .separator:after {
        content: attr(data-content);
        position: relative;
        display: inline-block;
        color: ${appearance.get() === 'dark' ? 'black' : '#ffffff;'};
        font-weight: 500;
        padding: 0 .5em;
        line-height: 1.5em;
        background-color: #818078;
        border-radius: 50px;
    }

    .ver-separator {
        border-left: 1px solid var(--vkui--color_separator_primary);
    }

    .ver-separator:after {
        border-radius: 50px;
    }
    
    .group-stats {
        display: flex; 
        align-items: center; 
        font-weight: bold; 
        font-size: 15px; 
        flex-direction: column;
        border-radius: 10px;
        height: 105px; 
        width: 95px;
        justify-content: center;
        transition: all 0.2s ease;
        cursor: default;
    }

    .ver-separator {
        border-right:1px #ff0000;
    }
    
    .color-text-subhead {
        color: var(--vkui--color_text_subhead);
    }
    
    .group-stats:hover:has(.button) {
        background-color: var(--vkui--color_background_secondary--active);
    }

    .group-stats:has(.button) {
        background-color: var(--vkui--color_background_secondary);
    }
    
    .group-stats:active:has(.button) {
        transition: all 0s ease;
        background-color: var(--vkui--color_background_secondary);
    }
    
    #back_button_modal_page {
        display: flex; 
        flex-direction: row; 
        text-decoration: none; 
        color: #99a2ad; 
        font-weight: bold; 
        padding-right: 10px; 
        gap: 3px;
        align-items: center;
    }
    
   .input-button {
        display: flex;
        align-items: center;
        padding: 3px;
        border-radius: 7px;
        height: 30px;
        width: 30px;
        border: none;
        justify-content: center;
        box-shadow: none;
        color: var(--vkui--color_text_subhead);
        font-weight: 500;
        background-color: var(--vkui--color_background_secondary);
        transition: all 0.2s ease;
   }
   
   .input-button:hover {
        background-color: var(--vkui--color_background_secondary--active);
   }
   
   .input-button:active {
        transition: all 0s ease;
        background-color: var(--vkui--color_background_secondary); 
   }
   
   .input-text {
        box-shadow: none;
        outline: none;
        width: 300px;
        border: none;
        border-radius: 7px;
        align-items: center;
        display: flex;
        height: 25px;
        padding: 3px;
        padding-left: 5px;
        font-weight: 400;
        background-color: var(--vkui--color_background_secondary);
        transition: all 0.2s ease;
   }
   
   .input-text:hover {
        background-color: var(--vkui--color_background_secondary--active);
   }
   
   .chat-sc {
        display: flex; 
        font-weight: bold; 
        font-size: 15px; 
        flex-direction: column;
        background-color: var(--vkui--color_background_secondary);
        border-radius: 10px;
        height: 50px;
        width: 99%;
        padding: 5px;
        transition: all 0.2s ease;
        cursor: default;
   }
    
   .background-image-chat {
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        position: absolute;
        border-radius: 50px 12px 12px 50px;
        height: 58px;
        width: 519px;
        margin-right: 12px;
        filter: blur(5px);
   }


   .btn-chat {
        display: flex;
        text-align: center; 
        align-items: center; 
        flex-direction: row; 
        gap: 5px;
        justify-content: center; 
        cursor: default;
        background-color: var(--vkui--color_background_secondary);
        color: var(--vkui--color_text_accent_themed);
        transition: all 0.2s ease;
        height: 100%;
        width: 100%;
        border-radius: 8px;
    }

    .btn-chat:hover {
        background-color: var(--vkui--color_background_secondary--active);
    }

    .btn-chat:active {
        transition: all 0s ease;
        background-color: var(--vkui--color_background_secondary);
    }

   .btn-chat-users-show {
        cursor: default;
        color: #99a2ad;
        transition: all 0.2s ease;
   }

   .btn-chat-users-show:hover {
       color: ${appearance.get() === 'dark' ? '#babfc4' : '#86888b'};
   }

   .btn {
        display: flex;
        text-align: center; 
        align-items: center; 
        flex-direction: row; 
        gap: 5px;
        justify-content: center; 
        cursor: default;
        transition: all 0.2s ease;
        height: 100%;
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        border: none;
        border-radius: 5px;
        width: fit-content;
        background-color: var(--vkui--color_background_secondary);
        color: var(--vkui--color_text_accent_themed);
        font-height: 500;
        outline: 0px;
   }

   .btn:hover {
        background-color: var(--vkui--color_background_secondary--active);
   }
   
   .btn:active {
        transition: all 0s ease;
        background-color: var(--vkui--color_background_secondary);
   }


   .sort-select {
        display: flex;
        border: none;
        color: #99a2ad;
        border-radius: 5px;
        justify-content: center;
        align-items: center;
        margin-bottom: 3px;
        font-size: 14px;
        font-weight: 500;
   }

    .sort-select:focus {
        outline: none;
    }

    .sort-select > option {
        color: #99a2ad;
        align-items: center;
    }

    .sort-select > option:hover {
        background-color: var(--vkui--color_background_secondary--active);
    }

    .sort-select:hover {
        background-color: var(--vkui--color_background_secondary--active);
    }

    .sort-select {
        display: flex;
        border: none;
        color: #99a2ad;
        border-radius: 5px;
        justify-content: center;
        align-items: center;
        margin-bottom: 3px;
   }

    .input-number:focus {
        outline: none;
    }

    .input-number:hover {
        background-color: var(--vkui--color_background_secondary--active);
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    input[type="number"]:hover,
    input[type="number"]:focus {
            -moz-appearance: number-input;
    }

    input[type="date"]::-webkit-inner-spin-button,
    input[type="date"]::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
    }

    .quote {
        color: #99a2ad;
        padding: 1px 5px 1px 5px;
        border-radius: 5px;
        background-color: var(--vkui--color_background_secondary);
        transition: all 0.2s ease;
        cursor: default;
        box-shadow: -4px  0px 0px 0px var(--vkui--color_background_secondary--active);
    }

    .quote__text {
        font-weight: bold;
        display: flex; 
        align-items: center; 
        flex-direction: column;
    }
`)
};
setStyles();