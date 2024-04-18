// ==UserScript==
// @name            Fanbox utils
// @description     Utilities for Fanbox
// @author          MetalTxus
// @match           https://hnamomo.fanbox.cc/*
// @version         2024.06.18.20.40

// @require         http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  let initAttempt = 0;

  const scrollContentIntoView = () => {
    const postContent = jQuery(
      '[class*="PostDetailPage__Wrapper"] [class*="FileContent__Wrapper"]'
    );
    if (postContent.length) {
      postContent.eq(0).css({ 'scroll-margin-top': headerHeight });
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
  const headerHeight = '64px';

  window.addEventListener('focus', initialize);
  initialize();
})();
