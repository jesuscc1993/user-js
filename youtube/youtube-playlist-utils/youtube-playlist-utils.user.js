// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @version        2025.10.05.11.24
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// ==/UserScript==

(() => {
  'use strict';

  const INTERACTION_INTERVAL = 100;

  let intervalId;

  let lengthElement;
  let extraStatsElement;
  // let buttonElement;

  // const shouldRender = () => {
  //   return (
  //     location.href.includes('/playlist?list=') &&
  //     document.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer')
  //       .length
  //   );
  // };

  const getPlaylistLength = () => {
    let seconds = 0;

    const badges = document.querySelectorAll(
      'ytd-playlist-video-list-renderer ytd-thumbnail-overlay-time-status-renderer .badge-shape-wiz__text'
    );

    badges.forEach((el) => {
      if (el.innerText.includes(':')) {
        const timeString = el.innerText.replace(/\s*/g, '').split(':');
        if (timeString.length) seconds += parseInt(timeString.pop(), 10);
        if (timeString.length) seconds += parseInt(timeString.pop(), 10) * 60;
        if (timeString.length) seconds += parseInt(timeString.pop(), 10) * 3600;
      }
    });

    return {
      seconds,
      videos: badges.length,
    };
  };

  const formatLength = (length) => {
    const hours = Math.floor(length / 3600);
    const minutes = Math.floor((length % 3600) / 60);
    const seconds = length % 60;
    const minUnit = hours ? 3 : minutes ? 2 : 1;

    const formattedHours =
      minUnit > 2 ? `${formatTimeToken(hours, false)}:` : '';

    const formattedMinutes =
      minUnit > 1 ? `${formatTimeToken(minutes, !!hours)}:` : '';

    const formattedSeconds = formatTimeToken(seconds, !!minutes);

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  const formatTimeToken = (token, shouldPad) => {
    return shouldPad ? String(token).padStart(2, '0') : token;
  };

  const calculateExtraPlaylistStats = () => {
    const containerElement = document.querySelector(
      'ytd-playlist-byline-renderer'
    );
    if (containerElement && !containerElement.querySelector('.extra-stats')) {
      containerElement
        .querySelector('.metadata-stats')
        .prepend(extraStatsElement);
    }

    const playlistLength = getPlaylistLength();
    console.log(`Extra playlist stats:
  Videos:
    ${playlistLength.videos}
  Length:
    ${formatLength(playlistLength.seconds)}
  Length on average:
    ${formatLength(
      Math.round(playlistLength.seconds / playlistLength.videos)
    )}`);
    lengthElement.innerText = `Length: ${formatLength(
      playlistLength.seconds
    )} `;
  };

  // const handleButtonPresence = () => {
  //   if (shouldRender()) {
  //     const buttonContainerElement = jQuery('.ytd-playlist-byline-renderer').first();
  //     if (buttonContainerElement.length && !buttonContainerElement.find('#stats').before(buttonElement).length) {
  //       buttonContainerElement.prepend(buttonElement);
  //     }
  //   } else {
  //     buttonElement.remove();
  //   }
  // };

  const initialize = () => {
    lengthElement = document.createElement('span');

    extraStatsElement = document.createElement('span');
    extraStatsElement.className =
      'extra-stats byline-item style-scope ytd-playlist-byline-renderer';
    extraStatsElement.appendChild(lengthElement);

    unsafeWindow.calculateExtraPlaylistStats = calculateExtraPlaylistStats;

    bindForwardButton();

    // buttonElement = jQuery(`
    //   <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
    //     Calculate Extra Stats
    //   </tp-yt-paper-button>
    // `);
    // buttonElement.click(calculateExtraPlaylistStats);

    // const observer = new MutationObserver(handleButtonPresence);
    // observer.observe(document.body, { childList: true, subtree: true });
    // handleButtonPresence();
  };

  const bindForwardButton = () => {
    window.addEventListener(
      'mouseup',
      (e) => {
        if (e.button === 4) {
          const nextBtn = document.querySelector('.ytp-next-button');
          nextBtn ? nextBtn.click() : history.forward();
        }
      },
      true
    );
  };

  /* console utils */
  unsafeWindow.deleteUnavailable = () => {
    intervalId = setInterval(() => {
      let element =
        document.querySelector(
          'tp-yt-iron-dropdown:not([style*="display: none;"]) ytd-menu-service-item-renderer:nth-child(1)'
        ) ||
        document.querySelector(
          'ytd-playlist-video-renderer:has([src="https://i.ytimg.com/img/no_thumbnail.jpg"]) ytd-menu-renderer button'
        );

      element ? element.click() : clearInterval(intervalId);
    }, INTERACTION_INTERVAL);
  };

  unsafeWindow.deleteWatched = () => {
    intervalId = setInterval(() => {
      let element =
        document.querySelector(
          'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(8)) ytd-menu-service-item-renderer:nth-child(4)'
        ) ||
        document.querySelector(
          'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(7)) ytd-menu-service-item-renderer:nth-child(3)'
        ) ||
        document.querySelector(
          'ytd-playlist-video-renderer:has(:where(.ytd-thumbnail-overlay-resume-playback-renderer, .ytThumbnailOverlayProgressBarHost)) ytd-menu-renderer button'
        );

      element ? element.click() : clearInterval(intervalId);
    }, INTERACTION_INTERVAL);
  };

  unsafeWindow.deleteByText = (text) => {
    const renderers = document.querySelectorAll('ytd-playlist-video-renderer');
    const matches = Array.from(renderers).filter((el) => {
      const title = el.querySelector('#video-title');
      return title?.innerText.toLowerCase().includes(text.toLowerCase());
    });

    let count = matches.length;
    intervalId = setInterval(() => {
      const dropdownItem = document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]) ytd-menu-service-item-renderer:nth-child(3)'
      );
      if (dropdownItem) {
        dropdownItem.click();
        return;
      }

      matches[matches.length - count]
        .querySelector('ytd-menu-renderer button')
        .click();

      count <= 1 ? clearInterval(intervalId) : count--;
    }, INTERACTION_INTERVAL);
  };

  unsafeWindow.saveToWatchLater = () => {
    const videos = document.querySelectorAll(
      '#contents > ytd-rich-item-renderer.ytd-rich-grid-renderer:not(:has(:where(.ytd-thumbnail-overlay-resume-playback-renderer, .ytThumbnailOverlayProgressBarHost)))'
    );

    let i = 0;
    let intervalId = setInterval(() => {
      let element = document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]) yt-list-item-view-model:nth-child(2)'
      );

      while (!element && i < videos.length) {
        const button = videos[i++].querySelector(
          '.yt-lockup-view-model__metadata button'
        );
        if (button) {
          element = button;
          break;
        }
      }

      element ? element.click() : clearInterval(intervalId);
    }, INTERACTION_INTERVAL);
  };

  initialize();
})();
