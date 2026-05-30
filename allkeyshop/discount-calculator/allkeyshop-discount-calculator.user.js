// ==UserScript==
// @name           AllKeyShop - Discount Calculator
// @description    Calculates discounts against the best official price.
// @version        2026.05.30.13.40
// @author         MetalTxus

// @icon           https://www.allkeyshop.com/blog/wp-content/themes/aks-theme/assets/image/favicon-32x32.png
// @match          https://www.allkeyshop.com/blog/list/*
// ==/UserScript==

/* globals jQuery */

const SORT_BY_DISCOUNT = true;

(() => {
  'use strict';

  let rowsWithDiscount = [];

  const $container = jQuery('.akswl-list-body');

  jQuery('.game-row').each((_, e) => {
    const $row = jQuery(e);
    const $officialPrice = $row.find('.game-best-official-price');
    const $bestPrice = $row.find('.game-best-price');

    const officialPrice = parseFloat($officialPrice.text()) || undefined;
    const bestPrice = parseFloat($bestPrice.text()) || undefined;

    const discount =
      officialPrice !== undefined && bestPrice !== undefined
        ? ((officialPrice - bestPrice) / officialPrice) * 100
        : 0;
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

      $bestPrice.prepend(`
        <span class="metacritic-button-${discountColor}">
          &nbsp;-${roundedDiscount}%&nbsp;
        </span>
      `);
    } else {
      $bestPrice.parent().css({ opacity: 0.5 });
    }

    rowsWithDiscount.push({
      bestPrice,
      officialPrice,
      discount: roundedDiscount > 0 ? discount : undefined,
      $row: jQuery(e),
    });
  });

  if (SORT_BY_DISCOUNT) {
    rowsWithDiscount.sort(
      (a, b) =>
        (!a.officialPrice ? 1 : 0) - (!b.officialPrice ? 1 : 0) ||
        (b.discount || 0) - (a.discount || 0) ||
        (a.bestPrice || 0) - (b.bestPrice || 0),
    );

    jQuery.each(rowsWithDiscount, (_, { $row }) => $container.append($row));

    jQuery('.save-order').prop('disabled', false).click();
  }
})();
