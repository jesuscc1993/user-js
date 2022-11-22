// ==UserScript==
// @name           Nakama - Utils
// @description    Provides some utilities for the Nakama website.
// @version        2022.09.01
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @icon           https://nakama.social/icons/logo-circle.svg
// @match          https://nakama.social/*
// @require        http://code.jquery.com/jquery-3.6.1.min.js
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const settings = {
    blacklistedUsers: ['cristianhcd'],
    loadTimeout: 250, // incrementad este valor si el site os tarda mucho en cargar
    retryTimeout: 250
  };

  const removeBlacklistedUserPosts = () => {
    if (
      (
        location.href.includes('/posts') &&
        jQuery('.comments-wrapper').length &&
        !jQuery('.comments-wrapper p, .comments-wrapper .comments').length
      ) || (
        !location.href.includes('/posts') &&
        jQuery('.posts-tab').length &&
        !jQuery('.posts-tab post-item').length
      )
    ) {
      setTimeout(removeBlacklistedUserPosts, settings.retryTimeout);
      return;
    }

    jQuery('.post .username').each((i, e) => {
      if (settings.blacklistedUsers.includes(jQuery(e).text())) {
        jQuery(e).parents('.post').remove();
      }
    });
  }

  const run = () => {
    removeBlacklistedUserPosts();
  }

  // doesn't work
  // window.addEventListener('hashchange', run, false);

  setTimeout(run, settings.loadTimeout);
})();