// ==UserScript==
// @name            Fanbox utils
// @description     Utilities for Fanbox
// @author          MetalTxus
// @match           https://*.fanbox.cc/*
// @version         2024.06.18.23.14

// @require         http://code.jquery.com/jquery-3.2.1.min.js
// @icon            https://fanbox.cc/favicon.ico
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let initAttempt = 0;

  const scrollContentIntoView = () => {
    const postContent = jQuery(
      '[class*="PostDetailPage__Wrapper"] article:not(.scrolled)'
    ).eq(0);

    if (postContent.length) {
      postContent.addClass('scrolled');
      postContent.css({ 'scroll-margin-top': '96px' });
      postContent[0].scrollIntoView();
    } else if (initAttempt++ < maxTries) {
      setTimeout(scrollContentIntoView, 1000);
    }
  };

  const initialize = () => {
    initAttempt = 0;
    scrollContentIntoView();
  };

  const maxTries = 5;

  window.addEventListener('focus', initialize);
  initialize();
})();
