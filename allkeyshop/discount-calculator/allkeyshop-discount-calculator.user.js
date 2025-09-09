// ==UserScript==
// @name           AllKeyShop - Discount Calculator
// @description    Calculates discounts against the best official price.
// @version        2025.09.09.17.27
// @author         MetalTxus

// @match          https://www.allkeyshop.com/blog/list/*
// ==/UserScript==

/* globals jQuery */

const SORT_BY_DISCOUNT = true;

(() => {
  'use strict';

  let rowsWithDiscount = [];

  jQuery('.game-row').each((_, e) => {
    const $officialPrice = jQuery(e).find('.game-best-official-price');
    const $bestPrice = jQuery(e).find('.game-best-price');

    const officialPrice = parseFloat($officialPrice.text());
    const bestPrice = parseFloat($bestPrice.text());

    const discount = Math.round(
      ((officialPrice - bestPrice) / officialPrice) * 100
    );
    if (discount > 0) {
      $bestPrice.append(
        `<span class="metacritic-button-green">&nbsp;-${discount}%&nbsp;</span>`
      );
    }

    rowsWithDiscount.push({ discount, $row: jQuery(e) });
  });

  if (SORT_BY_DISCOUNT) {
    rowsWithDiscount.sort((a, b) => (a.discount < b.discount ? 1 : -1));

    const $container = jQuery('.akswl-list > tbody');
    jQuery.each(rowsWithDiscount, (_, { $row }) => $container.append($row));
  }
})();
