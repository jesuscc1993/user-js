// ==UserScript==
// @name           YouTube - Toggle videos buttons
// @description    Adds buttons to hide watched and/or upcoming videos from the subscription page / channel videos tab.
// @version        2023.03.14.10.24
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          *://*.youtube.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js

// @grant          GM.getValue
// @grant          GM.setValue
// ==/UserScript==

/* globals jQuery */

(async () => {
  'use strict';

  let buttonsContainer;
  let buttonsRow;
  let toggleUpcomingButton;
  let toggleWatchedButton;

  let upcomingHidden = await GM.getValue('upcomingHidden', false);
  let watchedHidden = await GM.getValue('watchedHidden', false);

  const shouldRenderButton = () => {
    return location.href.match(urlPattern) !== null;
  };

  const shouldRunScript = () => {
    return document.querySelectorAll(unprocessedVideosSelectors).length;
  };

  const runButtonTask = () => {
    if (shouldRenderButton()) {
      const buttonDestinationContainer = jQuery(
        buttonDestinationContainerSelector
      ).first();

      if (
        buttonDestinationContainer.length &&
        !buttonDestinationContainer.find(buttonsContainer).length
      ) {
        insertButtons(buttonDestinationContainer);
      }
    } else {
      buttonsContainer.remove();
    }
  };

  const runVideosTask = () => {
    if (shouldRunScript()) {
      setTimeout(processAllVideos, 150);
    }
  };

  const insertButtons = (buttonDestinationContainer) => {
    toggleWatchedButton.off('click').on('click', toggleWatchedVideos);
    toggleUpcomingButton.off('click').on('click', toggleUpcomingVideos);

    setButtonText(
      toggleWatchedButton,
      watchedHidden ? i18n.showWatched : i18n.hideWatched,
      { matchingVideosCount: 0 }
    );

    setButtonText(
      toggleUpcomingButton,
      upcomingHidden ? i18n.showUpcoming : i18n.hideUpcoming,
      { matchingVideosCount: 0 }
    );

    buttonDestinationContainer.prepend(buttonsContainer);
  };

  const processAllVideos = () => {
    if (upcomingHidden) processUpcomingVideos();
    if (watchedHidden) processWatchedVideos();
  };

  const toggleWatchedVideos = () => {
    watchedHidden = !watchedHidden;
    GM.setValue('watchedHidden', watchedHidden);
    processWatchedVideos();
  };

  const toggleUpcomingVideos = () => {
    upcomingHidden = !upcomingHidden;
    GM.setValue('upcomingHidden', upcomingHidden);
    processUpcomingVideos();
  };

  const processWatchedVideos = () => {
    processVideos(
      watchedHidden,
      watchedVideosSelector,
      toggleWatchedButton,
      watchedHidden ? i18n.showWatched : i18n.hideWatched
    );
  };

  const processUpcomingVideos = () => {
    processVideos(
      upcomingHidden,
      upcomingVideosSelector,
      toggleUpcomingButton,
      upcomingHidden ? i18n.showUpcoming : i18n.hideUpcoming
    );
  };

  const processVideos = (hide, matchingSelector, button, text) => {
    const matchingVideos = jQuery(matchingSelector).parents(videosSelector);
    hide
      ? matchingVideos.addClass('mt-hidden')
      : matchingVideos.removeClass('mt-hidden');

    const matchingVideosCount = matchingVideos && matchingVideos.length;
    setButtonText(button, text, { matchingVideosCount });
  };

  const setButtonText = (button, text, params) => {
    button.text(
      text.replace(/\{\s*matchingVideos\s*\}/g, params.matchingVideosCount)
    );
  };

  const initialize = () => {
    jQuery('head').append(baseStyle);

    toggleWatchedButton = jQuery(buttonTemplate);
    toggleUpcomingButton = jQuery(buttonTemplate);

    buttonsRow = jQuery(buttonsRowTemplate);
    buttonsRow.append(toggleWatchedButton);
    buttonsRow.append(toggleUpcomingButton);

    buttonsContainer = jQuery(buttonsContainerTemplate);
    buttonsContainer.append(buttonsRow);

    setInterval(runButtonTask, 150);
    setInterval(runVideosTask, 1000);

    console.info(
      `Script "Toggle videos buttons" ready for use on ${location.origin}`
    );
  };

  const urlPattern =
    /youtube.com\/((channel\/|c\/|@)(.*)\/videos|feed\/subscriptions|results|playlist)/;

  // texts
  const i18n = {
    hide: 'Hide',
    show: 'Show',
    watched: 'watched',
    upcoming: 'upcoming',
    buttonParams: '({ matchingVideos })',
  };

  i18n.hideWatched = `${i18n.hide} ${i18n.watched}`;
  i18n.hideUpcoming = `${i18n.hide} ${i18n.upcoming}`;

  i18n.showWatched = `${i18n.show} ${i18n.watched} ${i18n.buttonParams}`;
  i18n.showUpcoming = `${i18n.show} ${i18n.upcoming} ${i18n.buttonParams}`;

  // selectors
  const watchedVideosSelector = `[id="progress"]`;

  const upcomingVideosSelector = `[overlay-style="UPCOMING"]`;

  const buttonDestinationContainerSelector = `
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

  const unprocessedVideosSelectors = videosSelector
    .split(',')
    .map(
      (selector) =>
        `${selector}:not(.mt-hidden) ${watchedVideosSelector},\n${selector}:not(.mt-hidden) ${upcomingVideosSelector}`
    )
    .join(',');

  // templates
  const buttonTemplate = `
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-toggle-videos-Button" />
  `;

  const buttonsContainerTemplate = `
    <div class="mt-toggle-Videos-container"></div>
  `;

  const buttonsRowTemplate = `
    <div class="mt-toggle-videos-Buttons-row"></div>
  `;

  // style
  const baseStyle = `
    <style>
      .mt-toggle-Videos-container {
        width: 100%;
      }

      .mt-toggle-videos-Buttons-row {
        display: flex;
        grid-gap: 8px;
      }

      .mt-toggle-videos-Button {
        border-radius: 8px !important;
        flex: 1;
        margin: 0 !important;
      }

      .mt-hidden {
        display: none !important;
      }

      [page-subtype="channels"] .mt-toggle-Videos-container,
      [page-subtype="subscriptions"] .mt-toggle-Videos-container {
        margin-top: 24px;
      }

      .ytd-search ytd-section-list-renderer .mt-toggle-Videos-container {
        margin: 12px 0;
      }
    </style>
  `;

  initialize();
})();
