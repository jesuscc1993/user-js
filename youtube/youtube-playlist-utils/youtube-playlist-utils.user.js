// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @version        2026.09.09.23.48
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @grant          GM_registerMenuCommand

// @icon           https://www.youtube.com/favicon.ico
// @match          https://www.youtube.com/*

// ==/UserScript==

(() => {
  'use strict';

  const INTERACTION_INTERVAL = 125;

  const NOT_SAVED_TO_WATCH_LATER = ':not(.saved-to-watch-later)';

  let intervalId;

  let hiddenDropdownsStyle;
  let durationElement;
  let extraStatsElement;

  const getPlaylistLength = () => {
    let seconds = 0;

    const badges = document.querySelectorAll(
      'ytd-playlist-video-list-renderer ytd-thumbnail-overlay-time-status-renderer .ytBadgeShapeText',
    );

    badges.forEach((el) => {
      if (el.innerText.includes(':')) {
        const timeString = el.innerText.replace(/\s*/g, '').split(':');
        if (timeString.length) seconds += parseInt(timeString.pop(), 10);
        if (timeString.length) seconds += parseInt(timeString.pop(), 10) * 60;
        if (timeString.length) seconds += parseInt(timeString.pop(), 10) * 3600;
      }
    });

    return {
      seconds,
      videos: badges.length,
    };
  };

  const formatLength = (length) => {
    const hours = Math.floor(length / 3600);
    const minutes = Math.floor((length % 3600) / 60);
    const seconds = length % 60;
    const minUnit = hours ? 3 : minutes ? 2 : 1;

    const formattedHours =
      minUnit > 2 ? `${formatTimeToken(hours, false)}:` : '';

    const formattedMinutes =
      minUnit > 1 ? `${formatTimeToken(minutes, !!hours)}:` : '';

    const formattedSeconds = formatTimeToken(seconds, !!minutes);

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  const formatTimeToken = (token, shouldPad) => {
    return shouldPad ? String(token).padStart(2, '0') : token;
  };

  const calculateExtraPlaylistStats = () => {
    const containerElement = document.querySelector(
      'ytd-playlist-byline-renderer',
    );
    if (containerElement && !containerElement.querySelector('.extra-stats')) {
      containerElement
        .querySelector('.metadata-stats')
        .prepend(extraStatsElement);
    }

    const playlistLength = getPlaylistLength();
    console.log(`Extra playlist stats:
  Videos:
    ${playlistLength.videos}
  Length:
    ${formatLength(playlistLength.seconds)}
  Length on average:
    ${formatLength(
      Math.round(playlistLength.seconds / playlistLength.videos),
    )}`);
    durationElement.innerText = `Duration: ${formatLength(
      playlistLength.seconds,
    )} `;
  };

  const setDropdownsHidden = (hidden) => {
    hidden
      ? document.head.appendChild(hiddenDropdownsStyle)
      : hiddenDropdownsStyle.remove();
  };

  const queryDropdownSaveToWatchLaterItem = () => {
    return document.querySelector(
      'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(8)) ytd-menu-service-item-renderer:nth-child(2)',
    );
  };

  const queryDropdownDeleteItem = () => {
    return (
      document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(8)) ytd-menu-service-item-renderer:nth-child(4)',
      ) ||
      document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(5)) ytd-menu-service-item-renderer:nth-child(3)',
      ) ||
      document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]):has(:nth-child(4)) ytd-menu-service-item-renderer:nth-child(2)',
      )
    );
  };

  const processVideoMatches = (
    queryMatch,
    queryDropdownItem,
    processMatch,
    action,
  ) => {
    clearInterval(intervalId);
    setDropdownsHidden(true);

    intervalId = setInterval(() => {
      const dropdownItem = queryDropdownItem();
      if (dropdownItem) {
        dropdownItem.click();
        return;
      }

      const match = queryMatch();
      if (!match) {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        document
          .querySelectorAll('.saved-to-watch-later')
          .forEach((element) =>
            element.classList.remove('saved-to-watch-later'),
          );
        console.info(`Finished ${action} matches.`);
        return;
      }

      const title = match.querySelector('#video-title');
      const anchor = match.querySelector('a[href]');
      const button = match.querySelector('ytd-menu-renderer button');
      const callbackPayload =
        title && anchor && button ? { match, title, anchor, button } : null;

      if (!callbackPayload || !processMatch(callbackPayload)) {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        console.warn(`Aborted ${action} matches: unable to process video.`);
        return;
      }
    }, INTERACTION_INTERVAL);
  };

  const saveToWatchLaterVideoMatches = (queryMatch) => {
    processVideoMatches(
      queryMatch,
      queryDropdownSaveToWatchLaterItem,
      (payload) => {
        console.info(
          `Saving "${payload.title.innerText}" to Watch Later (${payload.anchor.href})`,
        );
        payload.match.classList.add('saved-to-watch-later');
        payload.button.click();
        return true;
      },
      'saving',
    );
  };

  const deleteVideoMatches = (queryMatch) => {
    processVideoMatches(
      queryMatch,
      queryDropdownDeleteItem,
      (payload) => {
        console.info(
          `Deleting "${payload.title.innerText}" (${payload.anchor.href})`,
        );
        payload.button.click();
        return true;
      },
      'deleting',
    );
  };

  const queryVideo = (subQuery = '') => {
    return document.querySelector(`
      ytd-playlist-video-renderer${subQuery},
      ytd-playlist-panel-video-renderer${subQuery}
    `);
  };

  const queryVideos = (subQuery = '') => {
    return document.querySelectorAll(`
      ytd-playlist-video-renderer${subQuery},
      ytd-playlist-panel-video-renderer${subQuery}
    `);
  };

  const findVideoByText = (videos, texts) => {
    return Array.from(videos).find((el) => {
      const titleEl = el.querySelector('#video-title');
      const title = titleEl?.innerText.normalize('NFKC').toLowerCase();
      return texts.some((text) => title?.includes(text.toLowerCase()));
    });
  };

  const deleteWatched = () => {
    deleteVideoMatches(() =>
      queryVideo(
        ':has(:where(ytw-thumbnail-overlay-resume-playback-renderer, .ytd-thumbnail-overlay-resume-playback-renderer, .ytThumbnailOverlayProgressBarHost))',
      ),
    );
  };

  const saveToWatchLaterByText = (...texts) => {
    saveToWatchLaterVideoMatches(() =>
      findVideoByText(queryVideos(NOT_SAVED_TO_WATCH_LATER), texts),
    );
  };

  const savePlaylistToWatchLater = () => {
    saveToWatchLaterVideoMatches(() => queryVideo(NOT_SAVED_TO_WATCH_LATER));
  };

  const deleteByText = (...texts) => {
    deleteVideoMatches(() => findVideoByText(queryVideos(), texts));
  };

  const deleteDuplicates = () => {
    deleteVideoMatches(() => {
      const videos = Array.from(queryVideos());
      const seen = new Set();
      return videos.find((el) => {
        const href = el.querySelector('#video-title').href;
        const id = new URL(href).searchParams.get('v');
        if (seen.has(id)) return true;
        seen.add(id);
        return false;
      });
    });
  };

  const deleteUnavailable = () => {
    clearInterval(intervalId);
    setDropdownsHidden(true);

    intervalId = setInterval(() => {
      let element =
        document.querySelector(
          'tp-yt-iron-dropdown:not([style*="display: none;"]) ytd-menu-service-item-renderer:nth-child(1)',
        ) ||
        document.querySelector(
          'ytd-playlist-video-renderer:has([src="https://i.ytimg.com/img/no_thumbnail.jpg"]) ytd-menu-renderer button',
        );

      if (element) {
        element.click();
      } else {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        console.info('Finished deleting unavailable videos.');
      }
    }, INTERACTION_INTERVAL);
  };

  const deleteAll = () => {
    if (
      confirm('Are you sure you want to delete all videos from this playlist?')
    ) {
      deleteVideoMatches(() => queryVideo());
    }
  };

  const saveGridToWatchLater = () => {
    const videos = document.querySelectorAll(
      '#contents > ytd-rich-item-renderer.ytd-rich-grid-renderer:not(:has(:where(.ytd-thumbnail-overlay-resume-playback-renderer, .ytThumbnailOverlayProgressBarHost)))',
    );
    if (!videos.length) return;

    clearInterval(intervalId);
    setDropdownsHidden(true);

    let i = 0;
    intervalId = setInterval(() => {
      let element = document.querySelector(
        'tp-yt-iron-dropdown:not([style*="display: none;"]) yt-list-item-view-model:nth-child(2)',
      );

      while (!element && i < videos.length) {
        const button = videos[i++].querySelector(
          '.ytLockupMetadataViewModelMenuButton button',
        );
        if (button) {
          element = button;
          break;
        }
      }

      if (element) {
        element.click();
      } else {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        console.info('Finished saving to Watch Later.');
      }
    }, INTERACTION_INTERVAL);
  };

  const initialize = () => {
    durationElement = document.createElement('span');

    extraStatsElement = document.createElement('span');
    extraStatsElement.className =
      'extra-stats byline-item style-scope ytd-playlist-byline-renderer';
    extraStatsElement.appendChild(durationElement);

    hiddenDropdownsStyle = document.createElement('style');
    hiddenDropdownsStyle.textContent =
      'tp-yt-iron-dropdown { opacity: 0 !important; }';

    unsafeWindow.calculateExtraPlaylistStats = calculateExtraPlaylistStats;
    unsafeWindow.deleteAll = deleteAll;
    unsafeWindow.deleteByText = deleteByText;
    unsafeWindow.deleteDuplicates = deleteDuplicates;
    unsafeWindow.deleteUnavailable = deleteUnavailable;
    unsafeWindow.deleteWatched = deleteWatched;
    unsafeWindow.saveGridToWatchLater = saveGridToWatchLater;
    unsafeWindow.savePlaylistToWatchLater = savePlaylistToWatchLater;
    unsafeWindow.saveToWatchLaterByText = saveToWatchLaterByText;

    GM_registerMenuCommand(
      'Calculate playlist duration',
      calculateExtraPlaylistStats,
    );
    GM_registerMenuCommand('Delete watched videos', deleteWatched);
    GM_registerMenuCommand('Delete duplicate videos', deleteDuplicates);
    GM_registerMenuCommand('Delete unavailable videos', deleteUnavailable);
    GM_registerMenuCommand('Delete all videos', deleteAll);
    GM_registerMenuCommand(
      'Save playlist to Watch Later',
      savePlaylistToWatchLater,
    );
    GM_registerMenuCommand('Save grid to Watch Later', saveGridToWatchLater);

    bindForwardButton();
  };

  const bindForwardButton = () => {
    window.addEventListener(
      'mouseup',
      (e) => {
        if (e.button === 4) {
          const currentVideoEl = document.querySelector(
            'ytd-playlist-panel-video-renderer[selected]',
          );
          const nextEl = currentVideoEl
            ? currentVideoEl?.nextElementSibling?.querySelector('a')
            : document.querySelector('.ytp-next-button');
          nextEl ? nextEl.click() : history.forward();
        }
      },
      true,
    );
  };

  initialize();
})();
