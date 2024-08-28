// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @version        2024.08.28.21.26
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// ==/UserScript==

// const settings = {
//   liteMode: true // add only as global function and not as button; saves on performance
// };

(() => {
  'use strict';

  let lengthElement, extraStatsElement /*, buttonElement */;

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
    /* lengthElement.innerHTML = `Length: ${playlistLength}&nbsp;`; */
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
    lengthElement.className = 'ytd-playlist-sidebar-primary-info-renderer';

    extraStatsElement = document.createElement('span');
    extraStatsElement.className =
      'extra-stats style-scope ytd-playlist-sidebar-primary-info-renderer';
    extraStatsElement.appendChild(lengthElement);

    unsafeWindow.calculateExtraPlaylistStats = calculateExtraPlaylistStats;

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

  initialize();
})();
