// ==UserScript==
// @name           (GitHub) GitHub Utils
// @description    Always ignore whitespace in GitHub PR diffs
// @version        2026.09.03.16.11
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @match          https://github.com/*/pull/*
// @match          https://github.com/*/compare*
// @run-at         document-start
// @grant          GM_registerMenuCommand

// @icon           https://github.githubassets.com/favicons/favicon-dark.png
// ==/UserScript==

(() => {
  'use strict';

  const prPathnameRegex = /^\/.+\/pull\/.*/;
  const prChangesPathnameRegex = /^\/.+\/pull\/\d+\/changes/;

  const replaceUrlToIgnoreWhitespaces = () => {
    const url = new URL(window.location.href);
    if (
      prChangesPathnameRegex.test(url.pathname) &&
      !url.searchParams.has('w')
    ) {
      url.searchParams.set('w', '1');
      window.location.replace(url.toString());
    } else {
      setTimeout(replaceUrlToIgnoreWhitespaces, 5000);
    }
  };

  const openPrCompare = () => {
    const url = new URL(window.location.href);
    if (prChangesPathnameRegex.test(url.pathname)) {
      const branches = [
        ...document.querySelectorAll('a[data-component="BranchName"]'),
      ];

      if (branches.length < 2) {
        throw new Error('Could not find both PR branches');
      }

      const base = branches[0].textContent.trim();
      const head = branches[1].textContent.trim();

      const repo = location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\//);

      if (!repo) {
        throw new Error('Not on a GitHub PR page');
      }

      const url = `https://github.com/${repo[1]}/${repo[2]}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;

      window.open(url, '_blank');
    }
  };

  const initialize = () => {
    unsafeWindow.openPrCompare = openPrCompare;
    GM_registerMenuCommand('Open PR compare', openPrCompare);

    replaceUrlToIgnoreWhitespaces();
  };

  initialize();
})();
