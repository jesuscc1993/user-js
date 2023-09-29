// ==UserScript==
// @name           YouTube - "Hide watched videos" button
// @description    Adds a button to hide all watched/upcoming videos from the subscription page
// @version        2022.12.23.18.21
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
    return location.href.match(urlPattern) !== null;
  }

  const hideWatchedVideos = () => {
    const watchedVideos = jQuery('[id="progress"], [overlay-style="UPCOMING"]').parents(videosSelector);
    watchedVideos.css('display', 'none');

    const videosLeftCount = jQuery(videosSelector).length - watchedVideos.length;
    buttonElement.text(`Hide watched (${watchedVideos.length} videos hid / ${videosLeftCount} videos left)`);
  };

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const buttonContainerElement = jQuery(buttonContainerSelector).first();
      if (buttonContainerElement.length && !buttonContainerElement.find(buttonElement).length) {
        buttonElement.off('click').on('click', hideWatchedVideos).text('Hide Watched');
        buttonContainerElement.prepend(buttonElement);
      }
    } else {
      buttonElement.remove();
    }
  };

  const initialize = () => {
    buttonElement = jQuery(buttonTemplate);
    setInterval(handleButtonPresence, 150);
    jQuery('head').append(style);
  }

  const buttonContainerSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-grid-renderer,
    [page-subtype="playlist"][role="main"] ytd-item-section-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-section-list-renderer,
    ytd-search[role="main"] ytd-section-list-renderer
  `;
  const videosSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-grid-row,
    [page-subtype="playlist"][role="main"] ytd-playlist-video-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-grid-video-renderer,
    ytd-search[role="main"] ytd-video-renderer
  `;
  const style = `
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
  `
  const buttonTemplate = `
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-hide-watched-button">
      Hide Watched
    </tp-yt-paper-button>
  `;
  const urlPattern = /youtube.com\/((channel\/|c\/|@)(.*)\/videos|feed\/subscriptions|results|playlist)/;

  initialize();

})();
