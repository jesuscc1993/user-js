// ==UserScript==
// @name         HumbleBundle Unredeemed Game List Compiler
// @description  Compiles a list of the unredeemed games
// @author       MetalTxus
// @version      1.0
// @match        https://www.humblebundle.com/home/keys
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let games;

  const compileGamesList = () => {
    games = [];

    jQuery('#hide-redeemed:not(:checked)').click()

    processPage();

    var outputWindow = window.open('');
    outputWindow.document.write('<title>HumbleBundle Game List</title>');
    outputWindow.document.write(games.sort().join('<br />'));
    outputWindow.document.close();
  }

  const processPage = () => {
    jQuery('.game-name h4').each((i, e) => games.push(e.textContent));

    const nextPage = jQuery('.jump-to-page.current').next();
    if (nextPage.length) {
      jQuery('.jump-to-page.current').next().click();
      processPage();
    }
  }

  unsafeWindow.compileGamesList = compileGamesList;
})();