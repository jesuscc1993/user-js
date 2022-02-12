// ==UserScript==
// @name           YouTube - MP3 downloader
// @description    Adds a "Download as MP3" button to the "watch video" page
// @author         MetalTxus
// @version        1.1.0

// @icon           https://www.youtube.com/favicon.ico
// @include        https://www.youtube.com*
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let intervalId;

  const downloadVideo = () => {
    window.open(location.href.split('&')[0].replace('https://www.youtube.com/watch?v=', 'https://320ytmp3.com/en36/download?type=ytmp3&url='));
  }

  const buttonElement = jQuery(`
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer">
      Download MP3
    </tp-yt-paper-button>
  `);
  buttonElement.click(downloadVideo);

  const addButton = () => {
    const subscribeButton = jQuery('#meta-contents #subscribe-button');
    if (subscribeButton.length && !jQuery('#meta-contents').find(buttonElement).length) {
      subscribeButton.before(buttonElement);
      clearInterval(intervalId);
    }
  };

  intervalId = setInterval(() => addButton(), 150);
})();