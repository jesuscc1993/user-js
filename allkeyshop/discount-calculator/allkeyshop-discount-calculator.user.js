// ==UserScript==
// @name           AllKeyShop - Discount Calculator
// @description    Calculates discounts against the best official price.
// @version        2025.09.09.17.14
// @author         MetalTxus

// @require        https://code.jquery.com/jquery-3.6.0.min.js
// @match          https://www.allkeyshop.com/blog/list/*
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  jQuery('.game-row').each((_, e) => {
    const officialPriceEl = jQuery(e).find('.game-best-official-price');
    const bestPriceEl = jQuery(e).find('.game-best-price');

    const officialPrice = parseFloat(officialPriceEl.text());
    const bestPrice = parseFloat(bestPriceEl.text());

    if (
      isNaN(officialPrice) ||
      isNaN(bestPrice) ||
      bestPrice == officialPrice
    ) {
      return;
    }

    const discount = Math.round(
      ((officialPrice - bestPrice) / officialPrice) * 100
    );
    bestPriceEl.append(
      `<span class="metacritic-button-green">&nbsp;-${discount}%&nbsp;</span>`
    );
  });
})();
