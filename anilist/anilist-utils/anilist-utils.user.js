// ==UserScript==
// @name           AniList - Utils
// @description    Provides additional features
// @version        2023.09.30.01.20
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @require        https://code.jquery.com/jquery-3.2.1.min.js
// @icon           https://anilist.co/favicon.ico
// @match          https://anilist.co/anime/*
// @match          https://anilist.co/manga/*
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const size = '720';

  const nyaaSearch = `https://nyaa.si/?f=0&s=seeders&o=desc`;

  const MEDIA_TYPE = {
    anime: { id: '1_2', label: 'anime' },
    manga: { id: '3_1', label: 'manga' }
  };

  const addLinkToSearch = () => {
    const title = jQuery('h1').text().replace(/\s+/g, ' ').replace(/(^\s+| - |:|!|\s+$)/g, '');
    const encodedTitle = encodeURI(title);

    const mediaType = location.href.indexOf('https://anilist.co/anime') > -1 ? MEDIA_TYPE.anime : MEDIA_TYPE.manga;

    const searchWrapper = jQuery('<div class="custom-search-wrapper"></div>');

    const ytAnchor = `<a title="Search for videos" href="https://www.youtube.com/results?search_query=${encodedTitle}+${mediaType.label}"></a>`;
    const ytIcon = `<img src="https://i.imgur.com/GGQjnb9.png">`;
    appendSearchAnchor(searchWrapper, ytAnchor, ytIcon);

    const picturesAnchor = `<a title="Search for images" href="https://www.google.es/search?tbm=isch&q=${encodedTitle} ${mediaType.label}"></a>`;
    const picturesIcon = `<img src="https://i.imgur.com/xeDBHKU.png">`;
    appendSearchAnchor(searchWrapper, picturesAnchor, picturesIcon);

    const torrentAnchor = `<a title="Search for torrents" href="${nyaaSearch}&c=${mediaType.id}&q=${size}+${encodedTitle}"></a>`;
    const torrentIcon = `<img src="https://i.imgur.com/y0sSoXk.png">`;
    appendSearchAnchor(searchWrapper, torrentAnchor, torrentIcon);

    const subsPleaseAnchor = `<a title="Search for SubsPlease torrents" href="${nyaaSearch}&c=${mediaType.id}&q=${size}+SubsPlease+${encodedTitle}"></a>`;
    const subsPleaseIcon = `<img src="https://i.imgur.com/21j5OcW.png">`;
    appendSearchAnchor(searchWrapper, subsPleaseAnchor, subsPleaseIcon);

    jQuery('.cover-wrap-inner').append(searchWrapper);

    jQuery('head').append(style);
  }

  const appendSearchAnchor = (container, anchorTpl, iconTpl) => {
    const anchor = jQuery(anchorTpl);
    anchor.append(iconTpl);
    container.append(anchor);
  }

  const style = `
    <style>
      .custom-search-wrapper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .custom-search-wrapper > * {
        display: inline-block;
      }

      .custom-search-wrapper img{
        width: 35px;
        height: auto;
      }

      .sidebar:not([style*="margin-top: 0px;"]) {
        margin-top: 224px !important;
      }
    </style>
  `

  setTimeout(addLinkToSearch, 500);
})();