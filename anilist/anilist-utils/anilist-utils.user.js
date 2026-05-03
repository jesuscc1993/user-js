// ==UserScript==
// @name           AniList - Utils
// @description    Provides additional features
// @version        2026.05.03.21.45
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @require        https://code.jquery.com/jquery-3.2.1.min.js
// @icon           https://anilist.co/favicon.ico
// @match          https://anilist.co/*
// ==/UserScript==

/* globals jQuery */

(() => {
  'use strict';

  const generateSearchLinks = () => {
    $imagesAnchor = jQuery(`<a title="Search for images"></a>`);
    bindSearchAnchor($imagesAnchor, getImageSearchUrl);
    appendSearchAnchor($searchWrapper, $imagesAnchor, imagesIconUrl);

    $youTubeAnchor = jQuery(`<a title="Search for videos"></a>`);
    bindSearchAnchor($youTubeAnchor, getVideoSearchUrl);
    appendSearchAnchor($searchWrapper, $youTubeAnchor, youTubeIconUrl);

    $torrentAnchor = jQuery(`<a title="Search for torrents"></a>`);
    bindSearchAnchor($torrentAnchor, getTorrentSearchUrl);
    appendSearchAnchor($searchWrapper, $torrentAnchor, torrentIconUrl);

    $subsPleaseAnchor = jQuery(
      `<a title="Search for SubsPlease torrents"></a>`,
    );
    bindSearchAnchor($subsPleaseAnchor, getSubsPleaseSearchUrl);
    appendSearchAnchor($searchWrapper, $subsPleaseAnchor, subsPleaseIconUrl);

    $weebCentralAnchor = jQuery(
      `<a title='Search for weeb central manga'></a>`,
    );
    bindSearchAnchor($weebCentralAnchor, getWeebCentralSearchUrl);
    appendSearchAnchor($searchWrapper, $weebCentralAnchor, weebCentralIconUrl);
  };

  const addLinkToSearch = () => {
    const container = jQuery('.cover-wrap-inner');
    if (container.length && !container.find('.custom-search-wrapper').length) {
      container.append($searchWrapper);

      $subsPleaseAnchor.toggle(getMediaType() === MediaType.anime);
      $weebCentralAnchor.toggle(getMediaType() === MediaType.manga);
    }
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
        default:
          return;
      }
    });
  };

  const getVideoSearchUrl = () => {
    return `${youTubeSearch}${getEncodedTitle()}+${getMediaTypeQuery()}`;
  };

  const getImageSearchUrl = () => {
    return `${googleSearch}${getEncodedTitle()}+${getMediaTypeQuery()}`;
  };

  const getWeebCentralSearchUrl = () => {
    return `${weebCentralSearch}${getEncodedTitle()}`;
  };

  const getTorrentSearchUrl = () => {
    const mediaType = getMediaType();
    return `${nyaaSearch}&c=${mediaType.id}&q=${getEncodedTitle()}`;
  };

  const getSubsPleaseSearchUrl = () => {
    const mediaType = getMediaType();
    return `${nyaaSearch}&c=${mediaType.id}&q=${getEncodedTitle()}+SubsPlease`;
  };

  const getTitle = () => {
    const enTitle = jQuery('.data-set')
      .filter(function () {
        return jQuery(this).find('.type').text().trim() == 'English';
      })
      .find('.value');
    const title = jQuery('h1');
    return (enTitle.length ? enTitle : title)
      .text()
      .replace(/\s+/g, ' ')
      .replace(/(^\s+| - |:|!|\s+$)/g, '');
  };

  const getEncodedTitle = () => {
    return encodeURI(getTitle()).replace(/%20/g, '+').replace(/&/g, '%26');
  };

  const getMediaType = () => {
    return location.href.indexOf('https://anilist.co/anime') > -1
      ? MediaType.anime
      : MediaType.manga;
  };

  const getMediaTypeQuery = () => {
    return getMediaType() === MediaType.anime ? 'anime -manga' : 'manga -anime';
  };

  /* console utils */
  unsafeWindow.clearActivity = () => {
    const interval = setInterval(() => {
      let element =
        document.querySelector(
          '.el-message-box__wrapper:not([style*="display: none;"]) .el-button--primary',
        ) ||
        document.querySelector(
          '.activity-entry .el-dropdown-menu div.el-dropdown-menu__item',
        );

      element ? element.click() : clearInterval(interval);
    }, 333);
  };

  const initialize = () => {
    jQuery('head').append(style);

    generateSearchLinks();
    setTimeout(addLinkToSearch, 150);

    setInterval(addLinkToSearch, 1000);
  };

  const $searchWrapper = jQuery('<div class="custom-search-wrapper"></div>');

  let $imagesAnchor;
  let $subsPleaseAnchor;
  let $torrentAnchor;
  let $youTubeAnchor;
  let $weebCentralAnchor;

  const videoResolution = '720';

  const weebCentralSearch = `https://weebcentral.com/search?text=`;
  const googleSearch = `https://www.google.es/search?udm=2&q=`;
  const nyaaSearch = `https://nyaa.si/?f=0&s=seeders&o=desc`;
  const youTubeSearch = `https://www.youtube.com/results?search_query=`;

  const weebCentralIconUrl = 'https://i.imgur.com/Eev4skC.png';
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

      .header .description {
        min-height: 240px;
      }

      .sidebar:not([style*="margin-top: 0px;"]) {
        margin-top: 80px !important;
      }

      .actions {
        grid-gap: 24px !important;
      }
    </style>
  `;

  initialize();
})();
