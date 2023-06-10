// ==UserScript==
// @name           YouTube - Toggle videos buttons
// @description    Adds buttons to hide watched and/or upcoming videos from the subscription page / channel videos tab.
// @version        2023.06.10.22.29
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
  let toggleLiveButton;
  let toggleUpcomingButton;
  let toggleWatchedButton;
  let toggleButtonsButton;
  let videosTotal;

  let liveHidden = await GM.getValue('liveHidden', false);
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
      (liveHidden || upcomingHidden || watchedHidden) &&
      !!document.querySelectorAll(unprocessedVideosSelectors).length;

    const videosShouldBeShown =
      (!liveHidden || !upcomingHidden || !watchedHidden) &&
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
    toggleLiveButton.off('click').on('click', toggleLiveVideos);
    toggleUpcomingButton.off('click').on('click', toggleUpcomingVideos);
    toggleWatchedButton.off('click').on('click', toggleWatchedVideos);
    toggleButtonsButton.off('click').on('click', toggleButtons);
    videosTotal = jQuery(videosSelector).length;

    const params = { matchingVideosCount: 0 };
    setButtonState(toggleLiveButton, i18n.live, liveHidden, params);
    setButtonState(toggleUpcomingButton, i18n.upcoming, upcomingHidden, params);
    setButtonState(toggleWatchedButton, i18n.watched, watchedHidden, params);

    buttonDestinationContainer.prepend(buttonsContainer);
  };

  const processAllVideos = () => {
    debug(`Processing videos...`);
    videosTotal = jQuery(videosSelector).length;
    if (liveHidden) processLiveVideos();
    if (upcomingHidden) processUpcomingVideos();
    if (watchedHidden) processWatchedVideos();
    debug(`All videos processed`);
  };

  const toggleLiveVideos = () => {
    liveHidden = !liveHidden;
    GM.setValue('liveHidden', liveHidden);
    processLiveVideos();
  };

  const toggleUpcomingVideos = () => {
    upcomingHidden = !upcomingHidden;
    GM.setValue('upcomingHidden', upcomingHidden);
    processUpcomingVideos();
  };

  const toggleWatchedVideos = () => {
    watchedHidden = !watchedHidden;
    GM.setValue('watchedHidden', watchedHidden);
    processWatchedVideos();
  };

  const toggleButtons = (newValue) => {
    buttonsHidden = typeof newValue == 'boolean' ? newValue : !buttonsHidden;
    GM.setValue('buttonsHidden', buttonsHidden);
    buttonsHidden
      ? buttonsRow.addClass('hide-buttons')
      : buttonsRow.removeClass('hide-buttons');
    toggleButtonsButton.text(buttonsHidden ? '+' : '-');
  };

  const processLiveVideos = () => {
    processVideos(toggleLiveButton, i18n.live, liveHidden, liveVideosSelector);
  };

  const processUpcomingVideos = () => {
    processVideos(
      toggleUpcomingButton,
      i18n.upcoming,
      upcomingHidden,
      upcomingVideosSelector
    );
  };

  const processWatchedVideos = () => {
    processVideos(
      toggleWatchedButton,
      i18n.watched,
      watchedHidden,
      watchedVideosSelector
    );
  };

  const processVideos = (button, buttonName, hidden, matchingSelector) => {
    const matchingVideos = jQuery(matchingSelector).parents(videosSelector);
    hidden
      ? matchingVideos.addClass('mt-hidden')
      : matchingVideos.removeClass('mt-hidden');
    const matchingVideosCount = matchingVideos && matchingVideos.length;

    setButtonState(button, buttonName, hidden, { matchingVideosCount });
  };

  const setButtonState = (button, buttonName, hidden, params) => {
    const suffix =
      params?.matchingVideosCount !== undefined
        ? `(${params.matchingVideosCount} / ${videosTotal})`
        : '';
    button.text(`${buttonName} ${suffix}`);
    hidden ? button.removeClass('on') : button.addClass('on');
  };

  const debug = enableDebug
    ? (message) => console.debug(`${scriptPrefix} ${message}`)
    : () => {};

  const initialize = () => {
    jQuery('head').append(baseStyle);

    toggleLiveButton = jQuery(buttonTemplate).addClass(
      ' mt-toggle-videos-button'
    );
    toggleUpcomingButton = jQuery(buttonTemplate).addClass(
      ' mt-toggle-videos-button'
    );
    toggleWatchedButton = jQuery(buttonTemplate).addClass(
      ' mt-toggle-videos-button'
    );
    toggleButtonsButton = jQuery(buttonTemplate).addClass(
      'mt-toggle-buttons-button'
    );

    buttonsRow = jQuery(buttonsRowTemplate);
    buttonsRow.append(toggleLiveButton);
    buttonsRow.append(toggleUpcomingButton);
    buttonsRow.append(toggleWatchedButton);
    toggleButtons(buttonsHidden);

    buttonsContainer = jQuery(buttonsContainerTemplate);
    buttonsContainer.append(buttonsRow);
    buttonsContainer.append(toggleButtonsButton);

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
    live: 'live',
    upcoming: 'upcoming',
    watched: 'watched',
  };

  // selectors
  const liveVideosSelector = `[overlay-style="LIVE"]`;
  const upcomingVideosSelector = `[overlay-style="UPCOMING"]`;
  const watchedVideosSelector = `[id="progress"]`;

  const buttonDestinationContainerSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-grid-renderer,
    [page-subtype="playlist"][role="main"] ytd-item-section-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-shelf-renderer,
    ytd-search[role="main"] ytd-section-list-renderer
  `;

  const videosSelector = `
    [page-subtype="channels"][role="main"] ytd-rich-item-renderer,
    [page-subtype="playlist"][role="main"] ytd-playlist-video-renderer,
    [page-subtype="subscriptions"][role="main"] ytd-rich-item-renderer,
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
    <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer mt-button" />
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
        display: flex;
        justify-content: right;
        padding-left: 45px;
        width: 612px;
        margin: 0 auto;
      }

      .mt-toggle-videos-buttons-row {
        display: flex;
      }

      .mt-toggle-videos-buttons-row.hide-buttons .mt-toggle-videos-button:not(.toggle-buttons-button) {
        display: none;
      }

      .mt-button {
        border-radius: 20px !important;
        margin: 0 !important;
        min-width: 192px;
        text-align: center;
      }

      .mt-toggle-videos-button {
        border-radius: 0 !important;
        margin: 0 !important;
        text-align: center;
        background: var(--yt-spec-additive-background) !important;
      }
      .mt-toggle-videos-button.on {
        background: var(--yt-spec-10-percent-layer) !important;
      }
      .mt-toggle-videos-button:first-child {
        border-radius: 20px 0 0 20px !important;
      }
      .mt-toggle-videos-button:last-child {
        border-radius: 0 20px 20px 0 !important;
      }

      .mt-toggle-buttons-button {
        background: transparent !important;
        flex: 0;
        min-width: 37px;
      }
      .mt-toggle-buttons-button:hover {
        background: var(--yt-spec-10-percent-layer) !important;
      }

      .mt-hidden {
        display: none !important;
      }

      [page-subtype="channels"] .mt-toggle-videos-container {
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
