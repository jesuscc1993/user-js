// ==UserScript==
// @name           nyaa.si - Batch Download
// @description    Allows batch download of all displayed results in one single click.
// @author         MetalTxus
// @version        1.1.1

// @grant          GM_xmlhttpRequest

// @icon           https://avatars3.githubusercontent.com/u/28658394?s=44
// @match          https://nyaa.si/*
// @namespace      https://github.com/jesuscc1993
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const delayBetweenDownloads = 150;

  const magnets = jQuery('a[href*="magnet:"]');

  const appendBatchDownloadButton = () => {
    const fileCount = magnets.length;
    if (fileCount) {
      const downloadAll = () => {
        downloadNext(magnets.toArray());
      }

      const downloadNext = (anchors) => {
        const anchor = anchors.pop();
        const url = anchor.href.split('&dn=')[0];
        const magnetTab = window.open(url);
        setTimeout(() => magnetTab.close(), delayBetweenDownloads);

        if (anchors.length) {
          setTimeout(() => downloadNext(anchors), delayBetweenDownloads);
        }
      }

      jQuery('.torrent-list').append(
        `<tr style="background: none;">
           <td colspan="9" align="center">
             <a title="Download all" href class="mt-batch-download">
               < Download all (${fileCount}) >
               <br>
               <i class="fa fa-fw fa-magnet"></i>
             </a>
           </td>
         </tr>`
      );
      jQuery('.mt-batch-download').click(event => {
        event.preventDefault();
        downloadAll();
      });

    }
  }

  const initialize = () => {
    appendBatchDownloadButton();
  }

  initialize();

})();