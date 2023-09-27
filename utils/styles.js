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
`);