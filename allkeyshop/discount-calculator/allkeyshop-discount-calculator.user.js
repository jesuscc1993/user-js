// ==UserScript==
// @name           AllKeyShop - Discount Calculator
// @description    Calculates discounts against the best official price.
// @version        2025.09.09.17.36
// @author         MetalTxus

// @icon           https://www.allkeyshop.com/blog/wp-content/themes/aks-theme/assets/image/favicon-32x32.png
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

    const discount = ((officialPrice - bestPrice) / officialPrice) * 100;
    if (discount > 0) {
      const discountColor =
        discount > 66 ? 'green' : discount > 33 ? 'yellow' : 'red';

      $bestPrice.append(`
        <span class="metacritic-button-${discountColor}">
          &nbsp;-${Math.round(discount)}%&nbsp;
        </span>
      `);
    }

    rowsWithDiscount.push({ discount, $row: jQuery(e) });
  });

  if (SORT_BY_DISCOUNT) {
    rowsWithDiscount.sort((a, b) => (a.discount < b.discount ? 1 : -1));

    const $container = jQuery('.akswl-list > tbody');
    jQuery.each(rowsWithDiscount, (_, { $row }) => $container.append($row));
  }
})();
