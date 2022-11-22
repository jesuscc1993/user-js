// ==UserScript==
// @name           Discord - Utils
// @description    Replaces Discord's favicon with the classic one and adds controls to the embedded videos.
// @version        2022.11.22.18.26
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://i.imgur.com/UP6UJmx.png
// @match          https://discord.com/*
// @require        http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(function() {
  'use strict';

  const addVideoControls = () => {
    jQuery('video[class*="embedVideo"]').attr('controls', '');
  }

  setInterval(addVideoControls, 1000);

  jQuery('link[rel="icon"]').attr('href', 'https://i.imgur.com/UP6UJmx.png');
})();