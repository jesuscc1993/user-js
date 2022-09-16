// ==UserScript==
// @name         HumbleBundle - Unredeemed Game List Compiler
// @description  Compiles a list of the unredeemed games
// @author       MetalTxus
// @version      2022.09.16.20.29
// @match        https://www.humblebundle.com/home/keys
// @icon         https://cdn.humblebundle.com/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let games;

  const compileGamesList = () => {
    games = [];

    jQuery('#hide-redeemed:not(:checked)').click();
    jQuery('.jump-to-page[data-index="0"]').click();

    setTimeout(processPage, 150);
  }

  const processPage = () => {
    jQuery('.game-name h4').each((i, e) => {
      const name = e.textContent;
      const link = `https://store.steampowered.com/search/?term=${encodeURI(name)}`;

      games.push(`
        <a href="${link}" target="_blank">
          ${name}
        </a>
      `);
    });

    const nextPage = jQuery('.jump-to-page.current').next();
    if (nextPage.length) {
      jQuery('.jump-to-page.current').next().click();
      processPage();
    } else {
      outputGames();
    }
  }

  const outputGames = () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Unredeemed HumbleBundle Games List</title>
        </head>

        <body>
          ${games.sort().join('<br />')}

          <p>
            <small>Unredeemed games count: ${games.length}</small>
          </p>
        </body>
      </html>
    `;
    downloadFile(html, 'unredeemed-humblebundle-games-list.html', 'text/plain');
  }

  const downloadFile = (content, fileName, type) => {
    const file = new Blob([content], { type });
    const href = URL.createObjectURL(file);
    jQuery(`<a href="${href}" download="${fileName}">`)[0].click();
  };

  const initialize = () => {
    jQuery('head').append(`
      <style>
        .generate-list-button {
           background:#f1f3f6;
           border:1px solid #ccc;
           padding:0 12px;
        }
      </style>
    `);

    const button = jQuery(`
      <button class="generate-list-button">
        Compile unredeemed games list
      </button>
    `);
    button.click(compileGamesList);
    jQuery('.search').before(button);
  }

  initialize();
})();