// ==UserScript==
// @name           nyaa.si - Batch Download
// @description    Allows batch download of all displayed results in one single click.
// @version        2026.07.30.16.41
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @grant          GM_xmlhttpRequest

// @icon           https://avatars3.githubusercontent.com/u/28658394?s=44
// @match          https://nyaa.si/*
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const unitThreshold = 1024;

  const delayBetweenDownloads = 150;

  const downloadButton = jQuery(`
    <a title="Download all" href class="mt-batch-download">
      <i class="fa fa-fw fa-magnet"></i
      ><span class="mt-batch-download-label">Download all</span
      ><i class="fa fa-fw fa-magnet"></i>
    </a>
  `);
  let magnets;

  const appendBatchDownloadButton = () => {
    magnets = jQuery(magnetsSelector);

    const fileCount = magnets.length;
    if (fileCount) {
      downloadButton.off('click').on('click', (event) => {
        event.preventDefault();
        downloadAll();
      });
      setButtonText();

      jQuery('.torrent-list').append(downloadButton);

      downloadButton
        .wrap(`<td colspan="9" align="center">`)
        .wrap(`<tr style="background: none;">`);
    }
  };

  const setButtonText = () => {
    downloadButton
      .find(buttonLabelSelector)
      .text(`Download all ${magnets.length} (${getTotalSizeGiB()} GB)`);
  };

  const getTotalSizeGiB = () => {
    let totalBytes = 0;

    jQuery('.torrent-list tbody tr td:nth-child(4)').each((_, col) => {
      const sizeText = jQuery(col).text().trim();
      const match = sizeText.match(/^([\d.]+)\s*(KiB|MiB|GiB|TiB)$/i);

      if (!match) {
        return;
      }

      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();

      const multipliers = {
        KIB: unitThreshold,
        MIB: unitThreshold ** 2,
        GIB: unitThreshold ** 3,
        TIB: unitThreshold ** 4,
      };

      totalBytes += value * multipliers[unit];
    });

    return (totalBytes / unitThreshold ** 3).toFixed(2);
  };

  const downloadAll = () => {
    downloadNext(magnets.toArray());
  };

  const downloadNext = (anchors) => {
    const anchor = anchors.pop();
    const url = anchor.href.split('&dn=')[0];
    const magnetTab = window.open(url);
    setTimeout(() => magnetTab.close(), delayBetweenDownloads);

    if (anchors.length) {
      setTimeout(() => downloadNext(anchors), delayBetweenDownloads);
    }
  };

  const onMutation = () => {
    magnets = jQuery(magnetsSelector);

    setButtonText();
  };

  const initialize = () => {
    appendBatchDownloadButton();

    window.onload = () => {
      new MutationObserver(onMutation).observe(
        document.querySelector('tbody'),
        { childList: true },
      );
    };
  };

  const magnetsSelector = 'a[href*="magnet:"]';
  const buttonLabelSelector = '.mt-batch-download-label';

  initialize();
})();
