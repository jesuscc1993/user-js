// ==UserScript==
// @name           HumbleBundle - Unredeemed Game List Compiler
// @description    Compiles a list of the unredeemed games
// @version        2022.09.19.11.12
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://cdn.humblebundle.com/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @match          https://www.humblebundle.com/home/keys
// @require        https://code.jquery.com/jquery-3.6.1.min.js
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
        <li>
          <a href="${link}" target="_blank">
            ${name}
          </a>
        </li>
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
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unredeemed HumbleBundle Games List</title>
          <link href="https://cdn.humblebundle.com/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png" rel="icon" />
          <style>
            ul {
              list-style: none;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>

        <body>
          <ul>
            ${games.sort().join('')}
          </ul>

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

  setTimeout(initialize, 150);
})();
