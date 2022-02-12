// ==UserScript==
// @name           YouTube - Remove watched videos button
// @description    Adds a button to remove all watched videos from the subscription page
// @author         MetalTxus
// @version        1.0.1

// @icon           https://www.youtube.com/favicon.ico
// @include        https://www.youtube.com*
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const shouldRender = () => {
    return location.href.includes('/subscriptions') || location.href.includes('/videos');
  }

  const removeWatchedVideos = () => {
    jQuery('[id="progress"]').parents('ytd-grid-video-renderer').remove();
  }

  const buttonElement = jQuery(`
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
      Remove Watched
    </tp-yt-paper-button>
  `);

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const containerElement = jQuery('ytd-shelf-renderer, ytd-two-column-browse-results-renderer #primary #header-container').first();
      if (containerElement.length && !containerElement.find(buttonElement).length) {
        buttonElement.click(removeWatchedVideos);
        containerElement.prepend(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  setInterval(() => handleButtonPresence(), 150);

})();