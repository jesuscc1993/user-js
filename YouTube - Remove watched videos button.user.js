// ==UserScript==
// @name           YouTube - Remove watched videos button
// @description    Adds a button to remove all watched videos from the subscription page
// @author         MetalTxus
// @version        1.0.0

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/feed/subscriptions
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let intervalId;

  const removeWatchedVideos = () => {
    jQuery('[id="progress"]').parents('ytd-grid-video-renderer').remove();
  }

  const buttonElement = jQuery(`
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
      Remove Watched
    </tp-yt-paper-button>
  `);
  buttonElement.click(removeWatchedVideos);

  const addButton = () => {
    const containerElement = jQuery('ytd-shelf-renderer').first();
    if (containerElement.length && !containerElement.find(buttonElement).length) {
      containerElement.prepend(buttonElement);
      clearInterval(intervalId);
    }
  };

  intervalId = setInterval(() => addButton(), 150);

})();