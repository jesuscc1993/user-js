// ==UserScript==
// @name           WebToon - Keyboard Navigation
// @description    Enables pagination with the keyboard arrows
// @version        2022.11.22.18.40
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://webtoons-static.pstatic.net/image/favicon/favicon.ico
// @match          https://www.webtoons.com/*
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// @require        https://raw.githubusercontent.com/jesuscc1993/user-js/master/libraries/key-navigation.js
// ==/UserScript==

/* globals setUpAnchorNavigation jQuery */

(() => {
  'use strict';

  setUpAnchorNavigation({
    left: '.pg_prev',
    right: '.pg_next'
  });
})();