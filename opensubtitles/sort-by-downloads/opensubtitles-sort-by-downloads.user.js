// ==UserScript==
// @name           (OpenSubtitles) Sort by downloads
// @description    Automatically sort by downloads.
// @version        2025.09.09.18.18
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @match          https://www.opensubtitles.org/en/search/*
// @icon           https://www.opensubtitles.org/favicon.ico
// @run-at         document-start
// ==/UserScript==

(() => {
  'use strict';

  const TOKEN = '/sort-7/asc-0';

  const url = new URL(window.location.href);
  if (!url.pathname.includes(TOKEN)) {
    url.pathname = url.pathname.replace(/\/?$/, TOKEN);
    window.location.replace(url.toString());
  }
})();
