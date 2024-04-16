// ==UserScript==
// @name           AniList - Utils
// @description    Provides additional features
// @version        2024.04.16.22.29
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

  const addLinkToSearch = () => {
    const searchWrapper = jQuery('<div class="custom-search-wrapper"></div>');

    const youTubeAnchor = jQuery(`<a title="Search for videos"></a>`);
    bindSearchAnchor(youTubeAnchor, getVideoSearchUrl);
    appendSearchAnchor(searchWrapper, youTubeAnchor, youTubeIconUrl);

    const imagesAnchor = jQuery(`<a title="Search for images"></a>`);
    bindSearchAnchor(imagesAnchor, getImageSearchUrl);
    appendSearchAnchor(searchWrapper, imagesAnchor, imagesIconUrl);

    const torrentAnchor = jQuery(`<a title="Search for torrents"></a>`);
    bindSearchAnchor(torrentAnchor, getTorrentSearchUrl);
    appendSearchAnchor(searchWrapper, torrentAnchor, torrentIconUrl);

    const subsPleaseAnchor = jQuery(
      `<a title="Search for SubsPlease torrents"></a>`
    );
    bindSearchAnchor(subsPleaseAnchor, getSubsPleaseSearchUrl);
    appendSearchAnchor(searchWrapper, subsPleaseAnchor, subsPleaseIconUrl);

    jQuery('.cover-wrap-inner').append(searchWrapper);

    jQuery('head').append(style);
  };

  const appendSearchAnchor = (container, anchor, iconUrl) => {
    anchor.addClass('custom-search');
    anchor.append(`<img src="${iconUrl}">`);
    container.append(anchor);
  };

  const bindSearchAnchor = (anchor, getSearchUrl) => {
    anchor.on('mousedown', (e) => {
      switch (e.which) {
        // LMB
        case 1:
          e.preventDefault();
          location.assign(getSearchUrl());
          break;

        // RMB
        case 2:
          e.preventDefault();
          window.open(getSearchUrl());
          break;

        // RMB
        case 3:
          return;
      }
    });
  };

  const getVideoSearchUrl = () => {
    return `${youTubeSearch}${getEncodedTitle()}+${getMediaType().label}`;
  };

  const getImageSearchUrl = () => {
    return `${googleSearch}${getEncodedTitle()}+${getMediaType().label}`;
  };

  const getTorrentSearchUrl = () => {
    return `${nyaaSearch}&c=${
      getMediaType().id
    }&q=${videoResolution}+${getEncodedTitle()}`;
  };

  const getSubsPleaseSearchUrl = () => {
    return `${nyaaSearch}&c=${
      getMediaType().id
    }&q=${videoResolution}+SubsPlease+${getEncodedTitle()}`;
  };

  const getTitle = () => {
    return jQuery('h1')
      .text()
      .replace(/\s+/g, ' ')
      .replace(/(^\s+| - |:|!|\s+$)/g, '');
  };

  const getEncodedTitle = () => {
    return encodeURI(getTitle());
  };

  const getMediaType = () => {
    return location.href.indexOf('https://anilist.co/anime') > -1
      ? MediaType.anime
      : MediaType.manga;
  };

  const videoResolution = '720';

  const googleSearch = `https://www.google.es/search?udm=2&q=`;
  const nyaaSearch = `https://nyaa.si/?f=0&s=seeders&o=desc`;
  const youTubeSearch = `https://www.youtube.com/results?search_query=`;

  const imagesIconUrl = 'https://i.imgur.com/xeDBHKU.png';
  const subsPleaseIconUrl = 'https://i.imgur.com/21j5OcW.png';
  const torrentIconUrl = 'https://i.imgur.com/y0sSoXk.png';
  const youTubeIconUrl = 'https://i.imgur.com/GGQjnb9.png';

  const MediaType = {
    anime: { id: '1_2', label: 'anime' },
    manga: { id: '3_1', label: 'manga' },
  };

  const style = `
    <style>
      .custom-search-wrapper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .custom-search {
        display: inline-block;
        cursor: pointer;
      }

      .custom-search-wrapper img {
        width: 35px;
        height: auto;
      }

      .sidebar:not([style*="margin-top: 0px;"]) {
        margin-top: 224px !important;
      }
    </style>
  `;

  setTimeout(addLinkToSearch, 500);
})();
