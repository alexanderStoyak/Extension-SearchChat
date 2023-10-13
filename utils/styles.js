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
        animation: loading-spinner 0.5s infinite linear;
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
        color: ${appearance === 'dark' ? 'black' : '#ffffff;'};
        text-align: center;
        height: 1.5em;
        opacity: .5;
    }
    .separator:before {
        content: '';
        background: linear-gradient(to right, transparent, #818078, transparent);
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 1px;
    }
    .separator:after {
        content: attr(data-content);
        position: relative;
        display: inline-block;
        color: ${appearance === 'dark' ? 'black' : '#ffffff;'};
        font-weight: 500;
        padding: 0 .5em;
        line-height: 1.5em;
        background-color: #818078;
        border-radius: 50px;
    }
    
    
    .group-stats {
        display: flex; 
        align-items: center; 
        font-weight: bold; 
        font-size: 15px; 
        flex-direction: column;
        background-color: var(--vkui--color_background_secondary);
        border-radius: 10px;
        height: 105px; 
        width: 95px;
        justify-content: center;
        transition: all 0.2s ease;
        cursor: default;
    }
    
    .color-text-subhead {
        color: var(--vkui--color_text_subhead);
    }
    
    .group-stats:hover:has(.button) {
        background-color: var(--vkui--color_background_secondary--active);
    }
    
    .group-stats:active:has(.button) {
        transition: all 0s ease;
        background-color: var(--vkui--color_background_secondary);
    }
    
    #back-button-modal-page {
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
   
   .chat-sc > #test {
   display: flex; align-items: flex-end; justify-content: flex-end; font-weight: 600; text-decoration: none; color: #99a2ad;
   
   }
   
   .chat-sc-title {
        display: flex; 
        
   }
`);