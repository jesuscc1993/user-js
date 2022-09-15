// ==UserScript==
// @name         HumbleBundle - Unredeemed Game List Compiler
// @description  Compiles a list of the unredeemed games
// @author       MetalTxus
// @version      2022.09.14.23.31
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

    setTimeout(processPage, 150);
  }

  const processPage = () => {
    jQuery('.game-name h4').each((i, e) => games.push(e.textContent));

    const nextPage = jQuery('.jump-to-page.current').next();
    if (nextPage.length) {
      jQuery('.jump-to-page.current').next().click();
      processPage();
    } else {
      outputGames();
    }
  }

  const outputGames = () => {
    var outputWindow = window.open('');
    outputWindow.document.write('<title>HumbleBundle Game List</title>');
    outputWindow.document.write(games.sort().join('<br />'));
    outputWindow.document.close();
  }

  const button = jQuery(`<button style="background:#f1f3f6;border:1px solid #ccc;padding:0 12px;">Compile games list</button>`);
  button.click(compileGamesList);
  jQuery('.search').before(button);
})();