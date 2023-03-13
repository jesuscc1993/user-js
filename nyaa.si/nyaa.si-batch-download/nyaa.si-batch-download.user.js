// ==UserScript==
// @name           nyaa.si - Batch Download
// @description    Allows batch download of all displayed results in one single click.
// @version        2022.04.13
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @grant          GM_xmlhttpRequest

// @icon           https://avatars3.githubusercontent.com/u/28658394?s=44
// @match          https://nyaa.si/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
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