// ==UserScript==
// @name           YouTube - MP3 downloader
// @description    Adds a "Download as MP3" button to the "watch video" page
// @version        2022.04.13
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const shouldRender = () => {
    return location.href.includes('watch?');
  }

  const downloadVideo = () => {
    window.open(location.href.split('&')[0].replace('https://www.youtube.com/watch?v=', 'https://320ytmp3.com/en36/download?type=ytmp3&url='));
  }

  const buttonElement = jQuery(`
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer">
      Download MP3
    </tp-yt-paper-button>
  `);

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const subscribeButton = jQuery('#meta-contents #subscribe-button');
      if (subscribeButton.length && !jQuery('#meta-contents').find(buttonElement).length) {
        buttonElement.click(downloadVideo);
        subscribeButton.before(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  setInterval(handleButtonPresence, 150);

})();