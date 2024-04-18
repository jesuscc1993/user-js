// ==UserScript==
// @name            Fanbox utils
// @description     Utilities for Fanbox
// @author          MetalTxus
// @match           https://hnamomo.fanbox.cc/*
// @version         2024.06.18.20.16

// @require         http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* globals jQuery setUpKeyNavigation */

(() => {
  'use strict';

  let tries = 5;

  const scrollContentIntoView = () => {
    const postContent = jQuery(
      '[class*="PostDetailPage__Wrapper"] [class*="FileContent__Wrapper"]'
    );
    if (postContent.length) {
      postContent.eq(0).css({ 'scroll-margin-top': headerHeight });
      postContent[0].scrollIntoView();
    } else if (tries-- > 0) {
      setTimeout(scrollContentIntoView, 1000);
    }
  };

  scrollContentIntoView();

  const headerHeight = '64px';
})();
