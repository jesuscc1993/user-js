// ==UserScript==
// @name           YouTube - Remove watched videos button
// @description    Adds a button to remove all watched videos from the subscription page
// @author         MetalTxus
// @version        1.0.7

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const shouldRender = () => {
    return location.href.includes('/subscriptions') || location.href.includes('/videos') || location.href.includes('/results');
  }

  const removeWatchedVideos = () => {
    const watchedVideos = jQuery('[id="progress"]').parents('ytd-grid-video-renderer, ytd-video-renderer').remove();
    watchedVideos.remove();

    const videosLeft = jQuery('ytd-grid-video-renderer, ytd-video-renderer');
    buttonElement.text(`Remove Watched (${watchedVideos.length} videos removed / ${videosLeft.length} videos left)`);

    // remove headers from sections past the first one
    jQuery('ytd-item-section-renderer:not(:nth-child(1))').css('border', 'none');
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) .grid-subheader').remove();
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) #contents.ytd-shelf-renderer').css('margin-top', 0);
  }

  const buttonElement = jQuery(`
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
      Remove Watched
    </tp-yt-paper-button>
  `);
  buttonElement.click(removeWatchedVideos);

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const gridContainerElement = jQuery('ytd-section-list-renderer, ytd-shelf-renderer, ytd-browse:first ytd-two-column-browse-results-renderer #primary #header-container').first();
      if (gridContainerElement.length && !gridContainerElement.find(buttonElement).length) {
        gridContainerElement.prepend(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  setInterval(handleButtonPresence, 150);

})();