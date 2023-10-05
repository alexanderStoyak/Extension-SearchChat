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
    
`);