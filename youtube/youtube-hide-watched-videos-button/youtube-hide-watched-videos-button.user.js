// ==UserScript==
// @name           YouTube - "Hide watched videos" button
// @description    Adds a button to hide all watched/upcoming videos from the subscription page
// @version        2022.11.23.21.07
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let buttonElement;

  const shouldRender = () => {
    return !!location.href.match(urlPattern).length;
  }

  const hideWatchedVideos = () => {
    const watchedVideos = jQuery('[id="progress"], [overlay-style="UPCOMING"]').parents(videosSelector);
    watchedVideos.css('display', 'none');

    const leftVideosCount = jQuery(videosSelector).length - watchedVideos.length;
    buttonElement.text(`Hide watched (${watchedVideos.length} videos hid / ${leftVideosCount} videos left)`);

    // remove headers from sections past the first one
    jQuery('ytd-item-section-renderer:not(:nth-child(1))').css('border', 'none');
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) .grid-subheader').css('display', 'none');
    jQuery('ytd-item-section-renderer:not(:nth-child(1)) #contents.ytd-shelf-renderer').css('margin-top', 0);
  };

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const buttonContainerElement = jQuery('[page-subtype="channels"] ytd-rich-grid-renderer, [page-subtype="subscriptions"] ytd-section-list-renderer, .ytd-search ytd-section-list-renderer').first();
      if (buttonContainerElement.length && !buttonContainerElement.find(buttonElement).length) {
        buttonElement.off('click').on('click', hideWatchedVideos);
        buttonContainerElement.prepend(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  const initialize = () => {
    buttonElement = buttonElement = jQuery(`
      <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-hide-watched-button">
        Hide Watched
      </tp-yt-paper-button>
    `);

    /*const observer = new MutationObserver(handleButtonPresence);
    observer.observe(document.body, { childList: true, subtree: true });

    handleButtonPresence();*/

    jQuery('head').append(`
      <style>
        .mt-hide-watched-button {
          border-radius: 8px !important;
          width: 100%;
        }

        [page-subtype="channels"] .mt-hide-watched-button,
        [page-subtype="subscriptions"] .mt-hide-watched-button {
          margin-top: 24px;
        }

        .ytd-search ytd-section-list-renderer .mt-hide-watched-button {
          margin: 12px 0;
        }
      </style>
    `);

    setInterval(handleButtonPresence, 150);
  }

  initialize();

  const videosSelector = 'ytd-grid-video-renderer, ytd-video-renderer, ytd-rich-item-renderer';
  const urlPattern = /youtube.com\/((channel|c)\/(.*)\/videos|feed\/subscriptions|results)/;
})();
