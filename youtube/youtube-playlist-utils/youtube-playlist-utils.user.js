// ==UserScript==
// @name           YouTube - Playlist Utils
// @description    Adds a length calculation to playlists.
// @version        2026.09.18.01.36
// @author         MetalTxus
// @namespace      https://github.com/jesuscc1993

// @grant          GM_registerMenuCommand
// @grant          GM_notification

// @icon           https://www.youtube.com/s/desktop/95e3a3fe/img/favicon.ico
// @match          https://www.youtube.com/*

// ==/UserScript==

(() => {
  'use strict';

  const INTERACTION_INTERVAL = 125;

  const PROCESSED_VIDEO_CLASS = 'mt-processed';
  const PROCESSED_VIDEO_QUERY = `.${PROCESSED_VIDEO_CLASS}`;
  const UNPROCESSED_VIDEO_QUERY = `:not(${PROCESSED_VIDEO_QUERY})`;

  let intervalId;

  let hiddenDropdownsStyle;
  let durationEl;
  let extraStatsEl;

  const getPlaylistLength = () => {
    let seconds = 0;

    const badges = document.querySelectorAll(
      'ytd-playlist-video-list-renderer ytd-thumbnail-overlay-time-status-renderer .ytBadgeShapeText',
    );

    badges.forEach((el) => {
      if (el.innerText.includes(':')) {
        const timeString = el.innerText.trim().replace(/\s*/g, '').split(':');
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
    const containerEl = document.querySelector('ytd-playlist-byline-renderer');
    if (containerEl && !containerEl.querySelector('.extra-stats')) {
      containerEl.querySelector('.metadata-stats').prepend(extraStatsEl);
    }

    const playlistLength = getPlaylistLength();
    const avgLength =
      playlistLength.videos > 0
        ? Math.round(playlistLength.seconds / playlistLength.videos)
        : 0;
    console.log(`Extra playlist stats:
  Videos:
    ${playlistLength.videos}
  Length:
    ${formatLength(playlistLength.seconds)}
  Length on average:
    ${formatLength(avgLength)}`);
    durationEl.innerText = `Duration: ${formatLength(playlistLength.seconds)} `;
  };

  const setDropdownsHidden = (hidden) => {
    hidden
      ? document.head.appendChild(hiddenDropdownsStyle)
      : hiddenDropdownsStyle.remove();
  };

  const scrollToBottomAndBack = () => {
    const app = document.querySelector(
      'ytd-app:has(ytd-browse:not([hidden]) .ytd-playlist-video-list-renderer)',
    );
    if (app) {
      window.scrollTo(0, app.scrollHeight);
      setTimeout(() => window.scrollTo(0, 0), INTERACTION_INTERVAL);
    }
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
    console.log(`Started ${action}...`);

    scrollToBottomAndBack();
    clearInterval(intervalId);
    setDropdownsHidden(true);

    intervalId = setInterval(() => {
      try {
        const dropdownItemEl = queryDropdownItem();
        if (dropdownItemEl) {
          dropdownItemEl.click();
          return;
        }

        const matchEl = queryMatch();
        if (!matchEl) {
          clearInterval(intervalId);
          setDropdownsHidden(false);
          document
            .querySelectorAll(PROCESSED_VIDEO_QUERY)
            .forEach((element) =>
              element.classList.remove(PROCESSED_VIDEO_CLASS),
            );

          notify('Finished', `Finished ${action}.`);
          return;
        }

        const titleEl = matchEl.querySelector('#video-title');
        const anchorEl = matchEl.querySelector('a[href^="/watch"]');
        const buttonEl = matchEl.querySelector('ytd-menu-renderer button');
        const callbackPayload =
          titleEl && anchorEl && buttonEl
            ? { matchEl, titleEl, anchorEl, buttonEl }
            : null;

        if (!callbackPayload || !processMatch(callbackPayload)) {
          clearInterval(intervalId);
          setDropdownsHidden(false);
          console.warn(`Aborted ${action}: unable to process video.`);
          return;
        }
      } catch (error) {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        notify('Error', `Error ${action}.`, `Error ${action}: ${error}`);
      }
    }, INTERACTION_INTERVAL);
  };

  const saveToWatchLaterVideoMatches = (queryMatch) => {
    processVideoMatches(
      queryMatch,
      queryDropdownSaveToWatchLaterItem,
      (payload) => {
        console.info(
          `Saving "${payload.titleEl.innerText.trim()}" to Watch Later (${payload.anchorEl.href})`,
        );
        payload.matchEl.classList.add(PROCESSED_VIDEO_CLASS);
        payload.buttonEl.click();
        return true;
      },
      'saving to Watch Later',
    );
  };

  const deleteVideoMatches = (queryMatch) => {
    processVideoMatches(
      queryMatch,
      queryDropdownDeleteItem,
      (payload) => {
        console.info(
          `Deleting "${payload.titleEl.innerText.trim()}" (${payload.anchorEl.href})`,
        );
        payload.buttonEl.click();
        return true;
      },
      'deleting video matches',
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
    return Array.from(videos).find((videoEl) => {
      const titleEl = videoEl.querySelector('#video-title');
      const title = titleEl?.innerText.trim().normalize('NFKC').toLowerCase();
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
      findVideoByText(queryVideos(UNPROCESSED_VIDEO_QUERY), texts),
    );
  };

  const savePlaylistToWatchLater = () => {
    saveToWatchLaterVideoMatches(() => queryVideo(UNPROCESSED_VIDEO_QUERY));
  };

  const deleteByText = (...texts) => {
    deleteVideoMatches(() => findVideoByText(queryVideos(), texts));
  };

  const deleteDuplicates = () => {
    deleteVideoMatches(() => {
      const videos = Array.from(queryVideos());
      const seen = new Set();
      return videos.find((el) => {
        const titleEl = el.querySelector('#video-title');
        const anchorEl = el.querySelector('a[href^="/watch"]');
        if (!(titleEl && anchorEl)) return false;

        const href = anchorEl.href;
        const id = new URL(href).searchParams.get('v');
        if (seen.has(id)) return true;

        seen.add(id);
        return false;
      });
    });
  };

  const deleteUnavailable = () => {
    const action = 'deleting unavailable videos';

    scrollToBottomAndBack();
    clearInterval(intervalId);
    setDropdownsHidden(true);

    intervalId = setInterval(() => {
      try {
        let elementEl =
          document.querySelector(
            'tp-yt-iron-dropdown:not([style*="display: none;"]) ytd-menu-service-item-renderer:nth-child(1)',
          ) ||
          document.querySelector(
            'ytd-playlist-video-renderer:has([src="https://i.ytimg.com/img/no_thumbnail.jpg"]) ytd-menu-renderer button',
          );

        if (elementEl) {
          elementEl.click();
        } else {
          clearInterval(intervalId);
          setDropdownsHidden(false);
          notify('Finished', `Finished ${action}.`);
        }
      } catch (error) {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        notify('Error', `Error ${action}.`, `Error ${action}: ${error}`);
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
    const action = 'saving grid to Watch Later';

    const videos = document.querySelectorAll(
      '#contents > ytd-rich-item-renderer.ytd-rich-grid-renderer:not(:has(:where(.ytd-thumbnail-overlay-resume-playback-renderer, .ytThumbnailOverlayProgressBarHost)))',
    );
    if (!videos.length) return;

    clearInterval(intervalId);
    setDropdownsHidden(true);

    let i = 0;
    intervalId = setInterval(() => {
      try {
        let elementEl = document.querySelector(
          'tp-yt-iron-dropdown:not([style*="display: none;"]) yt-list-item-view-model:nth-child(2)',
        );

        while (!elementEl && i < videos.length) {
          const button = videos[i++].querySelector(
            '.ytLockupMetadataViewModelMenuButton button',
          );
          if (button) {
            elementEl = button;
            break;
          }
        }

        if (elementEl) {
          elementEl.click();
        } else {
          clearInterval(intervalId);
          setDropdownsHidden(false);
          notify('Finished', `Finished ${action}.`);
        }
      } catch (error) {
        clearInterval(intervalId);
        setDropdownsHidden(false);
        notify('Error', `Error ${action}.`, `Error ${action}: ${error}`);
      }
    }, INTERACTION_INTERVAL);
  };

  const notify = (title, text, log = text, timeout = 3000) => {
    console.info(log);
    GM_notification({ title, text, timeout });
  };

  const initialize = () => {
    durationEl = document.createElement('span');

    extraStatsEl = document.createElement('span');
    extraStatsEl.className =
      'extra-stats byline-item style-scope ytd-playlist-byline-renderer';
    extraStatsEl.appendChild(durationEl);

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
