// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @version        2022.11.13.20.26
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

/* globals jQuery */

const settings = {
  liteMode: true // add only as global function and not as button; saves on performance
};

(() => {
  'use strict';

  let lengthElement, extraStatsElement, buttonElement;

  const shouldRender = () => {
    return location.href.includes('/playlist?list=') && jQuery('ytd-thumbnail-overlay-time-status-renderer').length;
  }

  const getPlaylistLength = () => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    jQuery('ytd-playlist-video-list-renderer ytd-thumbnail-overlay-time-status-renderer').each(
      (i, el) => {
        if (el.innerText.includes(':')) {
          const timeString = el.innerText.replace(/\s*/g, '').split(':');
          if (timeString.length) seconds += parseInt(timeString.pop(), 10);
          if (timeString.length) minutes += parseInt(timeString.pop(), 10);
          if (timeString.length) hours += parseInt(timeString.pop(), 10);
        }
      }
    );

    minutes += Math.floor(seconds / 60);
    seconds = seconds % 60;

    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const calculateExtraPlaylistStats = () => {
    const containerElement = jQuery('ytd-playlist-byline-renderer').first();
    if (containerElement.length && !containerElement.find(extraStatsElement).length) {
      containerElement.find('.metadata-stats').prepend(extraStatsElement);
    }

    const playlistLength = getPlaylistLength();
    console.log(`Playlist length: ${playlistLength}`);
    lengthElement.html(`Length: ${playlistLength}&nbsp;`);
  }

  const initialize = () => {
    lengthElement = jQuery(`<span class="ytd-playlist-sidebar-primary-info-renderer"></span>`);

    extraStatsElement = jQuery(`<span id="extra-stats" class="style-scope ytd-playlist-sidebar-primary-info-renderer"></span>`);
    extraStatsElement.append(lengthElement);

    unsafeWindow.calculateExtraPlaylistStats = calculateExtraPlaylistStats;

    /*buttonElement = jQuery(`
      <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
        Calculate Extra Stats
      </tp-yt-paper-button>
    `);
    buttonElement.click(calculateExtraPlaylistStats);

    const handleButtonPresence = () => {
      if (shouldRender()) {
        const buttonContainerElement = jQuery('.ytd-playlist-byline-renderer').first();
        if (buttonContainerElement.length && !buttonContainerElement.find('#stats').before(buttonElement).length) {
          buttonContainerElement.prepend(buttonElement);
        }
      } else {
        buttonElement.remove();
      }
    };

    const observer = new MutationObserver(handleButtonPresence);
    observer.observe(document.body, { childList: true, subtree: true });

    handleButtonPresence();*/
  }

  initialize();

})();