// ==UserScript==
// @name           YouTube - Automatic fullscreen
// @description    Automatically enters fullscreen when playing videos.
// @version        2023.10.02.20.17
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://www.youtube.com/favicon.ico
// @match          *://*.youtube.com/watch*
// ==/UserScript==

(() => {
  'use strict';

  const fullscreenize = () => {
    if (!document.fullscreenElement) {
      const video = document.querySelector('#player-container video:not(.already-fullscreened), .player-container video:not(.already-fullscreened)');
      if (video) {
        video.requestFullscreen();
        video.classList.add('already-fullscreened');
      }
    }
  }

  setInterval(fullscreenize, 1000);
})();