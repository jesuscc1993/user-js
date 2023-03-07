// ==UserScript==
// @name           YouTube - Hide videos buttons
// @description    Adds buttons to hide watched and/or upcoming videos from the subscription page / channel videos tab.
// @version        2023.03.07.17.07
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          *://*.youtube.com/*
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let hideWatchedButton, hideBothButton, hideUpcomingButton, buttonContainer;

  const shouldRender = () => {
    return location.href.match(urlPattern) !== null;
  }

  const watchedVideosSelector = '[id="progress"]';
  const upcomingVideosSelector = '[overlay-style="UPCOMING"]';

  const hideWatchedVideos = () => {
    hideVideos(watchedVideosSelector, hideWatchedButton, `Hide watched (-{ matchingVideos }/{ totalCount })`);
  };

  const hideUpcomingVideos = () => {
    hideVideos(upcomingVideosSelector, hideUpcomingButton, `Hide upcoming (-{ matchingVideos }/{ totalCount })`);
  };

  const hideBothVideos = () => {
    hideWatchedVideos();
    hideUpcomingVideos();

    const matchingVideosCount = jQuery(`${watchedVideosSelector}, ${upcomingVideosSelector}`).parents(videosSelector).length;
    const totalVideoCount = jQuery(videosSelector).length;
    hideBothButton.text(`Hide both (-${ matchingVideosCount }/${ totalVideoCount })`);
  };

  const hideVideos = (matchingSelector, button, text) => {
    const matchingVideos = jQuery(matchingSelector).parents(videosSelector);
    matchingVideos.css('display', 'none');

    const matchingVideosCount = matchingVideos.length;
    const totalVideoCount = jQuery(videosSelector).length;
    button.text(text
      .replace(/\{\s*matchingVideos\s*\}/g, matchingVideosCount)
      .replace(/\{\s*totalCount\s*\}/g, totalVideoCount));
  };

  const handleButtonPresence = () => {
    if (shouldRender()) {
      const destinationElement = jQuery(destinationElementSelector).first();
      if (destinationElement.length && !destinationElement.find(buttonContainer).length) {
        insertButtons(destinationElement);
      }
    } else {
      buttonContainer.remove();
    }
  };

  const insertButtons = (destinationElement) => {
    hideBothButton.off('click').on('click', hideBothVideos).text('Hide both');
    hideWatchedButton.off('click').on('click', hideWatchedVideos).text('Hide watched');
    hideUpcomingButton.off('click').on('click', hideUpcomingVideos).text('Hide upcoming');
    destinationElement.prepend(buttonContainer);
  }

  const initialize = () => {
    jQuery('head').append(style);

    buttonContainer = jQuery(`<div class="mt-hide-videos-container"></div>`);
    hideBothButton = jQuery(buttonTemplate).addClass('mt-hide-both');
    hideWatchedButton = jQuery(buttonTemplate);
    hideUpcomingButton = jQuery(buttonTemplate);
    buttonContainer.append(hideWatchedButton);
    buttonContainer.append(hideBothButton);
    buttonContainer.append(hideUpcomingButton);

    setInterval(handleButtonPresence, 150);
  }

  const destinationElementSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-grid-renderer,
    [page-subtype="playlist"][role="main"] ytd-item-section-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-section-list-renderer,
    ytd-search[role="main"] ytd-section-list-renderer
  `;
  const videosSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-item-renderer,
    [page-subtype="playlist"][role="main"] ytd-playlist-video-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-grid-video-renderer,
    ytd-search[role="main"] ytd-video-renderer
  `;
  const style = `
    <style>
      .mt-hide-videos-container {
        display: flex;
        grid-gap: 8px;
        width: 100%;
      }

      .mt-hide-videos-button {
        border-radius: 8px !important;
        flex: 1;
        margin: 0 !important;
      }

      [page-subtype="channels"] .mt-hide-videos-container,
      [page-subtype="subscriptions"] .mt-hide-videos-container {
        margin-top: 24px;
      }

      .ytd-search ytd-section-list-renderer .mt-hide-videos-container {
        margin: 12px 0;
      }

      @media only screen and (min-width: 1000px) {
        .mt-hide-both {
          flex: 2;
        }
      }
    </style>
  `
  const buttonTemplate = `
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-hide-videos-button" />
  `;
  const urlPattern = /youtube.com\/((channel\/|c\/|@)(.*)\/videos|feed\/subscriptions|results|playlist)/;

  initialize();

})();