// ==UserScript==
// @name           (GitHub) Always ignore whitespace
// @description    Always ignore whitespace in GitHub PR diffs
// @version        2026.07.20.09.40
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @match          https://github.com/*/pull/*
// @match          https://github.com/*/compare*
// @run-at         document-start

// @icon           https://github.githubassets.com/favicons/favicon-dark.png
// ==/UserScript==

(() => {
  'use strict';

  const prPathnameRegex = /^\/.+\/pull\/\d+\/changes/;

  const replaceUrl = () => {
    const url = new URL(window.location.href);
    if (prPathnameRegex.test(url.pathname) && !url.searchParams.has('w')) {
      url.searchParams.set('w', '1');
      window.location.replace(url.toString());
    }
  };
  replaceUrl();

  /* the idea for this fallback is to give enough time to navigate to the correct tab after opening a PR */
  setTimeout(replaceUrl, 5000);
})();
