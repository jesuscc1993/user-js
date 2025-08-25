// ==UserScript==
// @name           (GitHub) Always ignore whitespace
// @description    Always ignore whitespace in GitHub PR diffs
// @version        2025.08.25.15.15
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @match          https://github.com/*/pull/*/files*
// @run-at         document-start

// @icon           https://github.githubassets.com/favicons/favicon-dark.png
// ==/UserScript==

(() => {
  'use strict';

  const url = new URL(window.location.href);
  if (!url.searchParams.has('w')) {
    url.searchParams.set('w', '1');
    window.location.replace(url.toString());
  }
})();
