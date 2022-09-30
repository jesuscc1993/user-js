// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @author         MetalTxus
// @version        2022.09.30.22.19

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*
// @namespace      https://github.com/jesuscc1993/user-js
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

const settings = {
  liteMode: true // add only as global function and not as button; saves on performance
};

(() => {
  'use strict';

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

  const lengthElement = jQuery(`<span class="ytd-playlist-sidebar-primary-info-renderer"></span>`);

  const extraStatsElement = jQuery(`<div id="extra-stats" class="style-scope ytd-playlist-sidebar-primary-info-renderer"></div>`);
  extraStatsElement.append(lengthElement);

  const calculateExtraPlaylistStats = () => {
    const containerElement = jQuery('ytd-playlist-sidebar-primary-info-renderer').first();
    if (containerElement.length && !containerElement.find(extraStatsElement).length) {
      containerElement.find('#stats').append(extraStatsElement);
    }

    lengthElement.text(`Length: ${getPlaylistLength()}`);
  }
  unsafeWindow.calculateExtraPlaylistStats = calculateExtraPlaylistStats;

  if (!settings.liteMode) {
    const buttonElement = jQuery(`
      <tp-yt-paper-button class="style-scope ytd-subscribe-button-renderer" style="margin-top: 24px;">
        Calculate Extra Stats
      </tp-yt-paper-button>
    `);
    buttonElement.click(calculateExtraPlaylistStats);

    const handleButtonPresence = () => {
      if (shouldRender()) {
        const buttonContainerElement = jQuery('ytd-playlist-sidebar-primary-info-renderer').first();
        if (buttonContainerElement.length && !buttonContainerElement.find('#stats').before(buttonElement).length) {
          buttonContainerElement.prepend(buttonElement);
        }
      } else {
        buttonElement.remove();
      }
    };

    setInterval(handleButtonPresence, 150);
  }

})();