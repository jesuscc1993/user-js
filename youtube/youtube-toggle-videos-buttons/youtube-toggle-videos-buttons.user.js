// ==UserScript==
// @name           YouTube - Toggle videos buttons
// @description    Adds buttons to hide watched and/or upcoming videos from the subscription page / channel videos tab.
// @version        2023.05.21.20.30
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

  const enableDebug = false;

  let buttonsContainer;
  let buttonsRow;
  let currentUrl;
  let toggleUpcomingButton;
  let toggleWatchedButton;
  let toggleButtonsButton;
  let videosTotal;

  let upcomingHidden = await GM.getValue('upcomingHidden', false);
  let watchedHidden = await GM.getValue('watchedHidden', false);
  let buttonsHidden = await GM.getValue('buttonsHidden', false);

  const shouldRenderButton = () => {
    return location.href.match(urlPattern) !== null;
  };

  const shouldRunScript = () => {
    const oldUrl = currentUrl;
    currentUrl = location.href.split('?')[0];

    const oldVideosTotal = videosTotal;
    videosTotal = jQuery(videosSelector).length;

    const locationChanged = !!oldUrl && oldUrl !== currentUrl;
    const videosCountChanged = oldVideosTotal !== videosTotal;

    const videosShouldBeHidden =
      (upcomingHidden || watchedHidden) &&
      !!document.querySelectorAll(unprocessedVideosSelectors).length;

    const videosShouldBeShown =
      (!upcomingHidden || !watchedHidden) &&
      !!document.querySelectorAll(processedVideosSelectors).length;

    const shouldIt =
      shouldRenderButton() &&
      (locationChanged ||
        videosCountChanged ||
        videosShouldBeHidden ||
        videosShouldBeShown);

    if (shouldIt) {
      debug(`Videos should be processed
        locationChanged: ${locationChanged}
        videosCountChanged: ${videosCountChanged}
        videosShouldBeHidden: ${videosShouldBeHidden}
        videosShouldBeShown: ${videosShouldBeShown}`);
    }

    return shouldIt;
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
    toggleButtonsButton.off('click').on('click', toggleButtons);
    videosTotal = jQuery(videosSelector).length;

    const params = { matchingVideosCount: 0 };

    setButtonText(
      toggleWatchedButton,
      watchedHidden ? i18n.showWatched : i18n.hideWatched,
      params
    );

    setButtonText(
      toggleUpcomingButton,
      upcomingHidden ? i18n.showUpcoming : i18n.hideUpcoming,
      params
    );

    buttonDestinationContainer.prepend(buttonsContainer);
  };

  const processAllVideos = () => {
    debug(`Processing videos...`);
    videosTotal = jQuery(videosSelector).length;
    if (upcomingHidden) processUpcomingVideos();
    if (watchedHidden) processWatchedVideos();
    debug(`All videos processed`);
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

  const toggleButtons = (newValue) => {
    buttonsHidden = typeof newValue == 'boolean' ? newValue : !buttonsHidden;
    GM.setValue('buttonsHidden', buttonsHidden);
    buttonsHidden ? buttonsRow.addClass('hide-buttons') : buttonsRow.removeClass('hide-buttons');
    toggleButtonsButton.text(buttonsHidden ? '+' : '-');
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
    const suffix =
      params?.matchingVideosCount !== undefined
        ? `(${params.matchingVideosCount} / ${videosTotal})`
        : '';
    button.text(`${text} ${suffix}`);
  };

  const debug = enableDebug
    ? (message) => console.debug(`${scriptPrefix} ${message}`)
    : () => {};

  const initialize = () => {
    jQuery('head').append(baseStyle);

    toggleWatchedButton = jQuery(buttonTemplate);
    toggleUpcomingButton = jQuery(buttonTemplate);
    toggleButtonsButton = jQuery(buttonTemplate).addClass('toggle-buttons-button');

    buttonsRow = jQuery(buttonsRowTemplate);
    buttonsRow.append(toggleWatchedButton);
    buttonsRow.append(toggleUpcomingButton);
    buttonsRow.append(toggleButtonsButton);
    toggleButtons(buttonsHidden);

    buttonsContainer = jQuery(buttonsContainerTemplate);
    buttonsContainer.append(buttonsRow);

    setInterval(runButtonTask, 150);
    setInterval(runVideosTask, 1000);

    console.info(`${scriptPrefix} Script initialized.`);
  };

  const scriptPrefix = `[Toggle videos buttons]`;

  const urlPattern =
    /youtube.com\/((channel\/|c\/|@)(.*)\/videos|feed\/subscriptions|results|playlist)/;

  // texts
  const i18n = {
    hide: 'Hide',
    show: 'Show',
    watched: 'watched',
    upcoming: 'upcoming',
  };

  i18n.hideWatched = `${i18n.hide} ${i18n.watched}`;
  i18n.hideUpcoming = `${i18n.hide} ${i18n.upcoming}`;

  i18n.showWatched = `${i18n.show} ${i18n.watched}`;
  i18n.showUpcoming = `${i18n.show} ${i18n.upcoming}`;

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
    [page-subtype="subscriptions"][role="main"] ytd-video-renderer,
    ytd-search[role="main"] ytd-video-renderer
  `;

  const unprocessedVideosSelectors = videosSelector
    .replace(/\n\s*/g, '')
    .split(',')
    .map(
      (selector) =>
        `${selector}:not(.mt-hidden) ${watchedVideosSelector}, ${selector}:not(.mt-hidden) ${upcomingVideosSelector}`
    )
    .join(',');

  const processedVideosSelectors = videosSelector
    .replace(/\n\s*/g, '')
    .split(',')
    .map(
      (selector) =>
        `${selector}.mt-hidden ${watchedVideosSelector}, ${selector}.mt-hidden ${upcomingVideosSelector}`
    )
    .join(',');

  // templates
  const buttonTemplate = `
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-toggle-videos-button" />
  `;

  const buttonsContainerTemplate = `
    <div class="mt-toggle-videos-container"></div>
  `;

  const buttonsRowTemplate = `
    <div class="mt-toggle-videos-buttons-row"></div>
  `;

  // style
  const baseStyle = `
    <style>
      .mt-toggle-videos-container {
        width: 100%;
      }

      .mt-toggle-videos-buttons-row {
        display: flex;
        grid-gap: 8px;
        justify-content: right;
        padding-left: 37px;
      }

      .mt-toggle-videos-buttons-row.hide-buttons .mt-toggle-videos-button:not(.toggle-buttons-button) {
        display: none;
      }

      .mt-toggle-videos-button {
        border-radius: 20px !important;
        flex: 1;
        margin: 0 !important;
      }

      .mt-toggle-videos-button.toggle-buttons-button {
        background: transparent;
        flex: 0;
        min-width: 37px;
      }
      .mt-toggle-videos-button.toggle-buttons-button:hover {
        background: var(--yt-spec-10-percent-layer);
      }

      .mt-hidden {
        display: none !important;
      }

      [page-subtype="channels"] .mt-toggle-videos-container,
      [page-subtype="subscriptions"] .mt-toggle-videos-container {
        margin-top: 24px;
      }

      [page-subtype="playlist"] .mt-toggle-videos-container {
        box-sizing: border-box;
        padding: 0 24px;
      }

      .ytd-search ytd-section-list-renderer .mt-toggle-videos-container {
        margin: 12px 0;
      }
    </style>
  `;

  initialize();
})();
