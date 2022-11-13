// ==UserScript==
// @name           YouTube - Remove watched videos button
// @description    Adds a button to remove all watched/upcoming videos from the subscription page
// @author         MetalTxus
// @version        2022.11.14.00.10

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let buttonElement;

  const shouldRender = () => {
    console.log("location.href.includes('/subscriptions')", location.href.includes('/subscriptions'))
    return location.href.includes('/subscriptions');
  }

  const removeWatchedVideos = () => {
    const watchedVideos = jQuery('[id="progress"], [overlay-style="UPCOMING"]').parents(videosSelector).remove();
    watchedVideos.remove();

    const videosLeft = jQuery(videosSelector);
    buttonElement.text(`Remove Watched (${watchedVideos.length} videos removed / ${videosLeft.length} videos left)`);

    // remove headers from sections past the first one
    jQuery('ytd-item-section-renderer:not(:nth-child(1))').css('border', 'none');
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) .grid-subheader').remove();
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) #contents.ytd-shelf-renderer').css('margin-top', 0);
  };

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const buttonContainerElement = jQuery('[page-subtype="subscriptions"] ytd-section-list-renderer').first();
      if (buttonContainerElement.length && !buttonContainerElement.find(buttonElement).length) {
        buttonElement.off('click').on('click', removeWatchedVideos);
        buttonContainerElement.prepend(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  const initialize = () => {
    buttonElement = buttonElement = jQuery(`
      <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px; border-radius: 8px;">
        Remove Watched
      </tp-yt-paper-button>
    `);

    /*const observer = new MutationObserver(handleButtonPresence);
    observer.observe(document.body, { childList: true, subtree: true });

    handleButtonPresence();*/

    setInterval(handleButtonPresence, 150);
  }

  initialize();

  const videosSelector = 'ytd-grid-video-renderer, ytd-video-renderer, ytd-rich-item-renderer';
})();
