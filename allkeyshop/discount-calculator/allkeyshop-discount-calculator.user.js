// ==UserScript==
// @name           AllKeyShop - Discount Calculator
// @description    Calculates discounts against the best official price.
// @version        2025.10.31.16.50
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

    const officialPrice = parseFloat($officialPrice.text()) || 999;
    const bestPrice = parseFloat($bestPrice.text()) || 999;

    const discount = ((officialPrice - bestPrice) / officialPrice) * 100;
    const roundedDiscount = Math.round(discount);
    if (roundedDiscount > 0) {
      const discountColor =
        roundedDiscount >= 66
          ? 'green'
          : roundedDiscount >= 50
          ? 'yellow'
          : roundedDiscount >= 33
          ? 'red'
          : 'grey';

      $bestPrice.append(`
        <span class="metacritic-button-${discountColor}">
          &nbsp;-${roundedDiscount}%&nbsp;
        </span>
      `);
    } else {
      $bestPrice.parent().fadeTo(0, 0);
    }

    rowsWithDiscount.push({
      bestPrice,
      discount: roundedDiscount > 0 ? discount : undefined,
      $row: jQuery(e),
    });
  });

  if (SORT_BY_DISCOUNT) {
    rowsWithDiscount.sort((a, b) => {
      if (a.discount && b.discount) return b.discount - a.discount;
      if (!a.discount && !b.discount) return a.bestPrice - b.bestPrice;
      return a.discount ? -1 : 1;
    });

    const $container = jQuery('.akswl-list > tbody');
    jQuery.each(rowsWithDiscount, (_, { $row }) => $container.append($row));

    jQuery('.save-order').prop('disabled', false).click();
  }
})();
