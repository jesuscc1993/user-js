// ==UserScript==
// @name         Naruho.do - Configuración de Feeds
// @description  Solventa numerosos errores y añade múltiples características, como la recarga de imágenes, vídeo y audio o la recarga automática del contador de notificaciones con la opcional reproducción de una alerta de sonido al recibirlas nuevas.
// @author       MetalTxus
// @version      2022.08.14.13.59

// @require      https://dl.dropbox.com/s/hvb02m9hza4p7gu/typedLocalStorage.js

// @match        https://naruho.do/*
// @icon         https://cdn.naruho.do/images/favicon.ico
// ==/UserScript==

/* globals jQuery ndo toastr typedLocalStorage Pusher */

var userSettings = {};

/* ======================================================================================================================================== */
/* CONFIGURACIÓN DEL SCRIPT                                                                                                                 */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
/*  true                                                | Activo                                                                            */
/*  false                                               | Inactivo                                                                          */
/* "Thumbnail"                                          | Vista previa en miniatura                                                         */
/*                                                                                                                                          */
/* ======================================================================================================================================== */
/* - FEEDS -                                                                                                                                */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.feeds = {
  /* Ocultar posibles spoilers (todo mensaje que contenga la cadena "spoil")                                                              */
  hidePotentialSpoilers: true,
  /* ------------------------------------------------------------------------------------------------------------------------------------ */
  /* Limitar número de feeds en pantalla (gran mejora de rendimiento)                                                                     */
  limitNumber: true,
};
/* ======================================================================================================================================== */
/* - IMÁGENES -                                                                                                                             */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.imageParsing = {
  /* Habilitar configuración de imágenes                                                                                                  */
  enabled: true,
  /* Modo de visualización de las imágenes.                                                                                               */
  /* Posibles valores: 'thumbnail', 'spoiler'                                                                                             */
  mode: 'thumbnail',
  /* Para las miniaturas, dimensiones máximas                                                                                             */
  /* Tamaño en píxeles. '100%' para no limitar                                                                                            */
  dimensionLimits: { height: '282px', width: '50%' },
  /* Transición al mostrar/ocultar o agrandar/reducir imágenes.                                                                           */
  /* Posibles valores: 'none' (ninguna), 'fade' (desvanecer), 'elastic' (estirar)                                                         */
  transitionType: 'elastic',
  /* Eliminar los saltos de línea entre imágenes.                                                                                         */
  forceInline: true
};
/* ======================================================================================================================================== */
/* - VÍDEOS -                                                                                                                               */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.videoParsing = {
  /* Habilitar configuración de vídeos                                                                                                    */
  enabled: true,
  /* Modo de visualización de los vídeos.                                                                                                 */
  /* Posibles valores: 'full' (completo), 'spoiler', 'small' (título del vídeo + spoiler)                                                 */
  mode: 'small',
  /* Aplicar transición al mostrar/ocultar o agrandar/reducir vídeos.                                                                     */
  transitionEnabled: true
};
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
/* - EMOTICONOS -                                                                                                                           */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.emoticons = {
  /* Habilitar el uso de emoticonos                                                                                                       */
  enabled: false,
  /* Tipo de emoticonos ('nekopara')                                                                                                      */
  type: 'nekopara'
};
/* ======================================================================================================================================== */
/* - NOTIFICACIONES -                                                                                                                       */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.notifications = {
  /* Habilitar actualización periódica del contador de notificaciones                                                                     */
  reloadEnabled: true,
  /* Frecuencia de recarga de las notificaciones; en segundos                                                                             */
  reloadInterval: 5,
  /* Tono de alerta a reproducir al recibir nuevas notificaciones                                                                         */
  /* (Poner a false para deshabilitar la opción)                                                                                          */
  soundAlert: 'https://dl.dropboxusercontent.com/s/fyt8qlit746hafc/naruhodo_-_notification_sound.mp3',
  /* ------------------------------------------------------------------------------------------------------------------------------------ */
  desktopNotifications: {
    /* Habilitar notificaciones de escritorio                                                                                           */
    enabled: true,
    /* Ocultar notificaciones tras x segundos                                                                                           */
    /* (Poner a false para deshabilitar la opción)                                                                                      */
    fadeOut: 5
  }
};
/* ======================================================================================================================================== */
/* - USUARIOS -                                                                                                                             */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */
userSettings.userBlacklist = {
  /* Habilitar borrado del contenido de los usuarios ignorados                                                                            */
  enabled: true,
  /* Usuarios a ignorar.                                                                                                                  */
  /* Formato: ['nombre1', 'nombre2', 'nombre3']                                                                                           */
  users: []
};
/* ======================================================================================================================================== */
/* FIN DE LA CONFIGURACIÓN */
/* ======================================================================================================================================== */


var URLS = {
      STYLE: 'https://dl.dropbox.com/s/auaqhmjfpzihpfz/scriptsStyle.css?t=1573300835778',
      TEXT_TO_EMOJI_MAPPING: 'https://dl.dropbox.com/s/y04331cdb0lkive/textToEmojiMapping.js'
    },
    ICONS = {
      BATOTO: 'http://i.imgur.com/pjdtT60.png',
      MAL: 'http://i.imgur.com/UbjtGWU.png',
      ANILIST: 'https://i.imgur.com/JofdShH.png'
    },
    EMOTICONS = {
      'nekopara': {
        'baseURL': 'http://metaltxus.altervista.org/misc/nekoparaStickers/stickers/128px/',
        'colCount': 10,
        'fileExtension': 'png',
        'files': ['Chocola/Crying', 'Chocola/Dead', 'Chocola/Fidgeting', 'Chocola/Greeting', 'Chocola/Happy', 'Chocola/Laughter', 'Chocola/Mad', 'Chocola/OK', 'Chocola/Plane', 'Chocola/Punishment', 'Chocola/Scared', 'Chocola/Sitting', 'Chocola/Sorry', 'Chocola/Surprised', 'Chocola/Tehe', 'Vanilla/Approve', 'Vanilla/Blush', 'Vanilla/Confused', 'Vanilla/Creeped', 'Vanilla/Curious', 'Vanilla/Greeting', 'Vanilla/Lazy', 'Vanilla/Mad', 'Vanilla/NG', 'Vanilla/Shrug', 'Vanilla/Smirk', 'Vanilla/Stare', 'Vanilla/Still', 'Vanilla/Taunt', 'Vanilla/Upset', 'Chocola x Vanilla/Amazed', 'Chocola x Vanilla/Bedtime', 'Chocola x Vanilla/Comforting', 'Chocola x Vanilla/Cuddling', 'Chocola x Vanilla/GO', 'Chocola x Vanilla/Goodbye', 'Chocola x Vanilla/Holding Hands', 'Chocola x Vanilla/Lunchtime', 'Chocola x Vanilla/Satisfied', 'Chocola x Vanilla/Wake Up']
      },
      'meep': {
        'baseURL': 'https://dl.dropboxusercontent.com/u/110665426/Images/Emoticons/Meep/',
        'colCount': 16,
        'fileExtension': 'png',
        'files': ['angel', 'angry', 'ashamed', 'blushing', 'blushing_shy', 'confused', 'cool', 'crying', 'depressed', 'derp', 'doubting', 'extremely_ashamed', 'extremely_unsatisfied', 'geek', 'grin', 'happy', 'hyped', 'irritated', 'lmao', 'lol', 'love', 'meh', 'puking', 'rofl', 'shocked', 'shy', 'smile', 'tehe', 'unaffected', 'unsatisfied', 'unsure', 'upset']
      }
    },
    NOTIFICATION = {
      ICON: 'https://cdn.naruho.do/feed_uploads/jfEf89.png'
    },
    CONSOLE_NAME = '[Configuración de Feeds] ',
    CONFIRM_FEED_DELETION = '¿Borrar definitivamente este contenido?',
    CONFIRM_FEED_SHARING = '¿Compartir el feed de ',
    HTML5_VIDEO_COMPATIBLE_FORMATS = [
      { source: 'webm' },
      { source: 'mp4' },
      { source: 'm4v', value: 'mp4' },
      { source: 'ogv', value: 'ogg' }
    ],
    HTML5_AUDIO_COMPATIBLE_FORMATS = [
      { source: 'ogg' },
      { source: 'mp3' },
      { source: 'wav' }
    ],
    TEXT_TO_EMOJI_MAPPING;

var API_TOKENS = {
  BITLY: '2135c6ae28a4566c2b2444d9f33f3618076a5a7f',/*a29f37a0c61b44dd97724302e62587011fe99ed2*/
  YOUTUBE: 'AIzaSyCVNn3KIl6eP2sQ-LzogtnYGBw7zggvrMc'
};

var urlTitle, desktopNotification, toastrSettings, notificationAlertElement, notificationCount, isBitlyServiceDown, emoticons;

function parseMedia (html) {
  fixCommentCreation(html);
  parseComments(html);
  if (userSettings.userBlacklist.enabled) {
    removeIgnoredUsersContent(html);
  }
  parseAvatars(html);
  parseLinks(html);
  if (userSettings.videoParsing.enabled) {
    parseVideos(html);
  }
  if (userSettings.emoticons.enabled) {
    addEmoticons(html);
  }
}

function removeIgnoredUsersContent (html) {
  var feedSelector = '[id^="ndo-message-"]';
  var messageSelector = '[id^="ndo-comment-"]';

  userSettings.userBlacklist.users.forEach(function (user) {
    var ignoredUserProfileLink = '[href="/' + user.toLowerCase() + '"]';
    html.find(feedSelector + ' .message.box .user > a' + ignoredUserProfileLink).parents(feedSelector).remove();
    html.find(messageSelector + ' .message .user > a' + ignoredUserProfileLink).parents(messageSelector).remove();
  });
}

function parseAvatars (html) {
  html.find('.avatar:not(.mt_parsedAvatar)').each(function (i, avatar) {
    avatar = jQuery(avatar);
    var image = avatar.find('img');
    var avatarUrl = image.attr('src');

    avatar.html('<a href="' + avatarUrl + '">' + avatar.html() + '</a>');
    avatar.addClass('mt_parsedAvatar');
  });
  initializeImageViewer(html.find('.mt_parsedAvatar a'));
}

function parseComments (html) {
  html.find('.message p').toArray().forEach(function (comment) {
    comment = jQuery(comment);
    comment.html(comment.html().replace(/-{4,}<br>/g, '<hr>'));

    if (!!userSettings.feeds.hidePotentialSpoilers && comment.html().toLowerCase().indexOf('spoil') >= 0) {
      comment.hide();

      var spoilerMessage = jQuery('<p><strong>Contenido oculto debido a posible spoiler</strong></p>');
      var togglerButton = jQuery('<input type="button" class="smallBtn blue mt_inlineSpoiler" value="Mostrar de todas formas">');
      togglerButton.click(function () {
        togglerButton.hide();
        spoilerMessage.hide();
        comment.fadeIn();
      });
      comment.before(spoilerMessage);
      comment.before(togglerButton);
    }
  });
}

function textToEmoji (string) {
  if (TEXT_TO_EMOJI_MAPPING) {
    var mappingKeys = Object.keys(TEXT_TO_EMOJI_MAPPING);

    mappingKeys.forEach(function (mappingKey) {
      var mappingValue = TEXT_TO_EMOJI_MAPPING[mappingKey];
      string = replaceAllWords(string, mappingKey, mappingValue);
    });
  }

  return string;
}

function replaceAllWords (string, oldValue, newValue) {
  if (string) {
    string = ' ' + string.replace(/\n/g, ' \n ') + ' ';
    string = replaceAll(string, ' ' + oldValue + ' ', ' ' + newValue + ' ');

    if (string.indexOf(' ') === 0) {
      string = string.substr(1);
    }
    if (string.lastIndexOf(' ') === string.length - 1) {
      string = string.substr(0, string.length - 1);
    }

    string = string.replace(/\s{1}\n\s{1}/g, '\n');
  }

  return string;
}

function replaceAll (string, oldValue, newValue) {
  if (string) {
    string = string.split(oldValue).join(newValue);
  }

  return string;
}

function unshortBitlyLink (link, callback) {
  if (!isBitlyServiceDown) {
    var url = 'https://api-ssl.bitly.com/v3/expand?format=txt&access_token=' + API_TOKENS.BITLY + '&shortUrl=' + encodeURI(link.href);

    jQuery.ajax({
      url: url,
      type: 'GET',
      cache: 'true',
      success: function (actualURL) {
        setLinkText(link, actualURL);
      },
      error: function () {
        isBitlyServiceDown = true;
      },
      complete: function (response) {
        if (callback) {
          callback(link.href, response);
        }
      }
    });
  } else {
    callback(link.href);
  }
}

function setLinkText (link, url) {
  var urlParts = url.split('/');
  var domain = urlParts[2].replace('www.', '');
  var linkIcon;

  var linkText = domain;
  if (domain === 'myanimelist.net' && (url.indexOf('/anime/') >= 0 || url.indexOf('/manga/') >= 0)) {
    linkText = decodeURIComponent(urlParts.pop().replace(/\?.*\b/, '')).replace(/_/g, ' ');
    linkIcon = ICONS.MAL;

  } else if (domain === 'bato.to' && url.indexOf('/comic/_/comics/') >= 0) {
    var namePart = urlParts.pop();

    var isNameEmpty = /\r|\n/.exec(namePart);
    if (isNameEmpty && isNameEmpty.index === 0 && namePart.length === 1) {
      namePart = urlParts.pop();
    }

    linkText = uppercaseWords(decodeURIComponent(namePart.replace(/-r\d*\b/, '').replace(/\?.+/g, '')).replace(/-/g, ' '));
    linkIcon = ICONS.BATOTO;
  }

  jQuery(link).attr('href', url);
  jQuery(link).text(linkText);
  jQuery(link).attr('title', url);
  jQuery(link).addClass('parsedLink');

  if (linkIcon) {
    jQuery(link).prepend(jQuery('<img class="mt-link-icon" src="' + linkIcon + '">'));
  }
}

function elementHasText (element) {
  return (element && element.textContent && removeSpaces(element.textContent).length > 0) === true;
}

function parseLinks (html) {
  // Fix DailyMotion videos
  html.find('iframe[src^="http://www.dailymotion.com"]').each(function (i, iframe) {
    iframe.src = 'https://' + iframe.src.split('http://')[1];
  });

  /* Test: https://naruho.do/alberto/message/616087 */
  html.find('a[href^="https://naruho.do/anime/"], a[href^="https://naruho.do/manga/"]').each(function (index, element) {
    element = jQuery(element);
    var url = element.attr('href');
    var mediaName = url.split(/\/anime\/|\/manga\//g)[1].replace(/\-/g, ' ');
    var mediaType = url.indexOf('anime') >= 0 ? 'anime' : url.indexOf('manga') >= 0 ? 'manga' : undefined;

    var malQueryUrl = 'https://myanimelist.net/search/all?q=' + mediaName;
    var malLink = jQuery('<a href="' + malQueryUrl + '"><img class="mt-link-icon" src="' + ICONS.MAL + '"></a>');
    element.after(malLink).after('&nbsp;');

    var anilistQueryUrl = 'https://anilist.co/search/' + mediaType + '?search=' + mediaName;
    var anilistLink = jQuery('<a href="' + anilistQueryUrl + '"><img class="mt-link-icon" src="' + ICONS.ANILIST + '"></a>');
    malLink.after(anilistLink).after('&nbsp;');
  });

  html.find('.message p').each(function (index, parent) {
    var links = jQuery(parent).find('a[href*="://bit.ly/"]');

    links.each(function (j, element) {
      element = jQuery(element);
      var url = element.attr('href');

      unshortBitlyLink(element[0], function (url) {
        if (userSettings.imageParsing.enabled) {
          urlToImage(element, url, index, jQuery(parent).parents('.message'));
        }
        if (userSettings.videoParsing.enabled) {
          urlToVideo(element, url);
          urlToAudio(element, url);
        }
      });
    });

    initializeImageViewer(jQuery('a[rel=fancyPost' + index + ']'));
  });
}

function urlToImage (element, url, index, html) {
  jQuery("<img>", {
    src: url,
    load: function (event) {
      if (isAnImage(event.target)) {
        var urlParts = url.split('/');

        html.find('[class^="center zoom"]').remove();

        element.attr('target', '');
        element.attr('rel', 'fancyPost' + index);
        element.html({
          thumbnail: '<img class="mt_thumbnail" src="' + url + '" alt title="Haz click para ampliar">',
          spoiler: '<span class="smallBtn blue mt_unselectable mt_clickable mt_inlineSpoiler" onclick="jQuery(this).next().toggle();"> ' +
          '[IMG] ' + urlParts[urlParts.length -1] + '</span>'
        }[userSettings.imageParsing.mode]);

        var prevElement = element[0].previousSibling;

        if (prevElement !== null) {
          var prevElementType = getElementType(prevElement), lineBefore = prevElement.previousSibling;
          if (lineBefore !== null && lineBefore.textContent && removeSpaces(lineBefore.textContent).length < 1) {
            lineBefore = lineBefore.previousSibling;
          }
          var prevElementHasText = elementHasText(prevElement), lineBeforeHasText = elementHasText(lineBefore);
          var isThereTextBefore = prevElementHasText || (lineBeforeHasText && !jQuery(lineBefore).hasClass('parsedLink'));

          if (userSettings.imageParsing.forceInline && prevElementType === 'BR' && !isThereTextBefore) {
            prevElement.remove();
            element.before(' ');
          } else if (prevElementType !== 'BR' && (isThereTextBefore || !userSettings.imageParsing.forceInline)) {
            element.before('<br>');
          }
        }
      } else {
        console.debug(event);
      }
    }
  });
}

function urlToVideo (element, url) {
  urlToFacebook(element, url);
  urlToVimeo(element, url);
  //urlToDailyMotion(element, url);
  urlToHTML5Video(element, url);
}

function urlToFacebook (element, url) {
  var videoRegex = 'https:\/\/www\.facebook\.com\/.*\/videos\/',
      playerUrl = 'https://www.facebook.com/v2.3/plugins/video.php?app_id=113869198637480&href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F';

  if (url.search(videoRegex) > -1) {
    var idPrefix = '/videos/';

    var videoID = (url.substr(url.indexOf(idPrefix) + idPrefix.length)).split('/')[0];

    var parent = element.parent();
    var width = parent.innerWidth();
    var height = parent.innerWidth() / 16 * 9;

    buildIFramePlayer(element, playerUrl, videoID, {
      width: width,
      height: height,
      disableSpoiler: /*true*/false
    });
  }
}

function urlToVimeo (element, url) {
  urlToIFramePlayer(element, url, {
    prefix: 'https://vimeo.com/',
    playerUrl: 'https://player.vimeo.com/video/'
  });
}

function urlToDailyMotion (element, url) {
  urlToIFramePlayer(element, url, {
    prefix: 'https://www.dailymotion.com/video/',
    playerUrl: '//www.dailymotion.com/embed/video/'
  });
}

function urlToIFramePlayer (element, url, settings) {
  if (settings && settings.prefix && settings.playerUrl) {
    if (url.indexOf(settings.prefix) > -1) {
      var videoID = url.split(settings.prefix)[1];
      buildIFramePlayer(element, settings.playerUrl, videoID);
    }
  }
}

function urlToHTML5Video (element, url) {
  url = imgurGifvToMp4(element, url);

  HTML5_VIDEO_COMPATIBLE_FORMATS.forEach(function (format) {
    if (url.indexOf('.' + format.source) > -1) {
      jQuery("<video>", {
        src: url,
        success: function () {
          var extension = format.value || format.source;
          var videoElement = jQuery('<video controls class="mt_html5-player mt_html5-video mt_full-width"></video>');
          videoElement.append('<source src="' + url + '" type="video/' + extension + '">');
          element.after(videoElement);
          parseVideos(element.parent());
        }
      });
    }
  });
}

function parseVideos (html) {
  html.find(`
        .message iframe[src*="youtube.com"]:not(.mt_video),
        .message iframe[src*="dailymotion.com"]:not(.mt_video),
        .message iframe[src*="player.vimeo.com"]:not(.mt_video),
        .message embed[src*="crunchyroll.com"]:not(.mt_video),
        .mt_html5-video:not(.mt_video)`
  ).each(function (i, element) {
    jQuery(element).parents('p').css({'max-height': 'none'});

    wrapVideoInSpoiler(element);
  });
}

function imgurGifvToMp4 (element, url) {
  if (url.indexOf('i.imgur.com') > -1 && url.indexOf('.gifv') > -1) {
    url = url.replace('.gifv', '.mp4');
    element.attr('href', url.replace('.gifv', '.mp4'));
  }
  return url;
}

function buildIFramePlayer (element, playerUrl, videoID, optionalSettings) {
  var height = optionalSettings && optionalSettings.height || 360;
  var width = optionalSettings && optionalSettings.width || undefined;
  var selector = 'mt_generic-iframe-player-' + videoID;

  var newHTML = '<iframe src="' + playerUrl + videoID + '" height="' + height + '"';
  var classes = selector;
  if (width) {
    newHTML += ' width="' + width + '"';
  } else {
    classes += ' mt_full-width';
  }
  newHTML += ' class="' + classes + '" webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder="0"></iframe>';

  element.after('<br>' + newHTML);
  element = jQuery('.' + selector);

  if (!optionalSettings || !optionalSettings.disableSpoiler) {
    wrapVideoInSpoiler(element);
  }
}

function urlToAudio (element, url) {
  HTML5_AUDIO_COMPATIBLE_FORMATS.forEach(function (format) {
    if (url.indexOf('.' + format.source) > -1) {
      jQuery("<audio>", {
        src: url,
        success: function () {
          var extension = format.value || format.source;
          var audioElement = getAudioElement(url, extension);
          element.replaceWith(audioElement);
        }
      });
    }
  });
}

function getAudioElement (url, extension) {
  var audioElement = jQuery('<audio controls class="mt_html5-player mt_html5-audio mt_full-width"></audio>');
  audioElement.append('<source src="' + url + '" type="audio/' + extension + '">');
  return audioElement;
}

function wrapVideoInSpoiler (player) {
  player = jQuery(player);

  if (!player.hasClass('mt_video')) {
    var classesToAdd = userSettings.videoParsing.transitionEnabled ? 'mt_video mt_animated' : 'mt_video';
    player.addClass(classesToAdd);
    player.parent().addClass('mt_videoContainer');

    var source = player.attr('src');
    if (source) {
      player.attr('domain', getURLDomain(source));
      getYouTubeVideoName(source.split('/embed/')[1]).then(function (title) {
        if (title) {
          player.attr('title', title);
          setSpoilerText(player);
        }
      });
    }

    if ((userSettings.videoParsing.mode === 'spoiler' || userSettings.videoParsing.mode === 'small')) {
      var spoiler = jQuery('<div class="smallBtn blue mt_unselectable mt_clickable mt_videoSpoiler"></div>');
      spoiler.click(function () {
        togglePlayerStatus(player);
      });
      player.before(spoiler);
      spoiler.click();
    }
  }

  return player;
}

function getURLDomain (url) {
  return url.split('//')[1].split('/')[0].replace('www.', '');
}

function getYouTubeVideoName (videoId) {
  var deferred = jQuery.Deferred();

  jQuery.get('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + API_TOKENS.YOUTUBE, function (data) {
    var response;

    if (data && data.items && data.items[0] && data.items[0].snippet) {
      response = data.items[0].snippet.title;
    }

    deferred.resolve(response);
  });

  return deferred.promise();
}

function addEmoticons (html) {
  var parentsSelector = '#shareForm, .add-comment';
  var emoticonWrapper = jQuery('<div class="emoticons-container" style="display: none;"></div>');

  emoticons.files.forEach(function (emoticon) {
    var emote = jQuery('<img src="'+ emoticonFromName(emoticon) + '" title="' + emoticon + '">');
    emote.click(onEmoticonClick);
    emoticonWrapper.append(emote);
  });

  var htmlButton = jQuery('<input type="button" class="smallBtn blue toggle-emoticons emoji emoji-button" value="☻">');
  htmlButton.click(function () {
    var parent = jQuery(this).parents(parentsSelector),
        oldParent = emoticonWrapper.parents(parentsSelector);

    if (parent[0] !== oldParent[0]) {
      emoticonWrapper.slideUp(0);

      if (parent.hasClass('add-comment')) {
        parent.append(emoticonWrapper);
      } else {
        html.find('#typeshare > div').after(emoticonWrapper);
      }

      scrollToElement(parent);
    }

    emoticonWrapper.slideToggle(200);
    parent.find('textarea').focus();
  });

  html.find('#typeshare > div, .add-comment .buttons').append(htmlButton);
}

function fixCommentCreation (html) {
  html.find('form').find('[type="submit"]').attr('type', 'button').addClass('submit').click(function () {
    var addComment = jQuery(this).parents('form');
    var textarea = addComment.find('textarea');
    var text = runReplacers(textarea.val());

    var isNewFeed = textarea.attr('id') === 'sharebox';
    if (isNewFeed) {
      text = textToEmoji(text);
    }

    if (userSettings.emoticons.enabled) {
      text = parseEmoticons(text);

      var emoticonsContainer = addComment.find('.emoticons-container');
      if (emoticonsContainer && emoticonsContainer.length) {
        emoticonsContainer.slideUp(200);
      }
    }

    textarea.val(text);
    jQuery(this).parents('form').submit();
  });
}

function emoticonFromName (name) {
  return emoticons.baseURL + name + '.' + emoticons.fileExtension;
}

function onEmoticonClick () {
  var parentsSelector = '.add-comment, #shareForm';
  var parent = jQuery(this).parents(parentsSelector);
  var input = parent.find('textarea');

  insertAtCursor(input[0], ':' + this.title + ':');
  input.focus();
}

function scrollToElement (element) {
  jQuery('html, body').animate({
    scrollTop: element.offset().top - jQuery('#header').outerHeight()
  }, 500);
}

function parseEmoticons (text) {
  emoticons.files.forEach(function (emoticon) {
    var code = ':' + emoticon + ':';
    text = replaceAll(text, code, encodeURI(emoticonFromName(emoticon)));
  });
  return text;
}

function runReplacers (text) {
  text = replaceAll(text, '<', '&lt;');
  text = replaceAll(text, '>', '&gt;');
  text = replaceAll(text, '♥', '❤');
  text = replaceAll(text, 'http://pasteboard.co', 'https://cdn.pbrd.co/images/');
  return text;
}

function insertAtCursor (textField, value) {
  if (textField.selectionStart || textField.selectionStart === '0') {
    var beforeCursor = textField.value.substr(0, textField.selectionStart);
    var afterCursor = textField.value.substr(textField.selectionEnd, textField.value.length);

    textField.value = beforeCursor + value + afterCursor;
    //textField.selectionStart = textField.selectionEnd = textField.selectionEnd + value.length;
  } else {
    textField.value += value;
  }
}

function loadFeedsFromTime (time) {
  saveFeedTimeToURL(time);
  time = time || getCurrentTimeInSeconds();

  var url = '/feeds/' + time;
  removeCurrentFeeds();

  jQuery.ajax({
    type: 'GET',
    dataType: 'json',
    url: url,
    success: function (data) {
      if(data.status == 200) {
        var nextTime = data.url.split('/feeds/')[1];
        jQuery('#long_feeds').html(ndo.events.feeds(data.html + jQuery('#long_feeds').html()));
        jQuery('.load-more').attr('href', nextTime).click(function (ev) {
          ev.preventDefault();
          loadFeedsFromTime(nextTime, true);
        });
        scrollToTop();
      } else alert('Error ' + data.status + '. El servidor devolvió: ' + data.text);
    },
    error: function (data) {
      alert('Error del servidor.');
    }
  });
}

function millisToSeconds (millis) {
  return parseInt(millis / 1000);
}

function getCurrentTimeInSeconds () {
  return millisToSeconds(Date.now());
}

function saveFeedTimeToURL (time) {
  if (time && !isNaN(time)) {
    history.pushState({}, 'Feeds from time ' + time, 'https://naruho.do?time=' + time);
  } else {
    history.pushState({}, '', 'https://naruho.do');
  }
}

function reloadFeeds (event) {
  if (event) event.preventDefault();
  scrollToTop();
  setTimeout(() => {
    loadFeedsFromTime(undefined, true);
  });
}

function removeCurrentFeeds () {
  jQuery('#long_feeds [id^="ndo-message"]').remove();
  scrollToTop();
}

function initializeImageViewer (elements) {
  elements.fancybox({
    openEffect  : userSettings.imageParsing.transitionType,
    closeEffect : userSettings.imageParsing.transitionType,
    nextEffect  : 'none',
    prevEffect  : 'none',
    type        : 'image',
    fitToView   : true,
    closeBtn    : false,
    closeClick  : true,
    helpers:  {
      title: null
    }
  });
}

function togglePlayerStatus (player) {
  var statusClass = ({ 'spoiler': 'hiddenPlayer', 'small': 'smallPlayer' })[userSettings.videoParsing.mode];
  player.toggleClass(statusClass);
  setSpoilerText(player);
}

function setSpoilerText (player) {
  var domain = player.attr('domain'),
      title = player.attr('title');
  var fixedText = ' ' + (title ? (' vídeo: "' + title + '"') : (' reproductor ' + (domain ? '(' + domain + ')' : '')));
  var settings = ({
    'spoiler': {
      class: 'hiddenPlayer',
      text: { show: 'Mostrar' + fixedText, hide: 'Ocultar' + fixedText }
    },
    'small': {
      class: 'smallPlayer',
      text: { show: 'Expandir' + fixedText, hide: 'Colapsar' + fixedText }
    }
  })[userSettings.videoParsing.mode];

  if (settings) {
    var spoiler = player.prev();
    var text = player.hasClass(settings.class) ? settings.text.show : settings.text.hide;
    spoiler.text(text);

  } else {
    console.warn(CONSOLE_NAME + 'El tipo de spoiler escogido es incorrecto');
  }
}


/* Notifications */

function getNotificationsCountFromString (string) {
  var notifications = string.split('(');
  var notificationCount = notifications.length ? parseInt(notifications[1]) : 0;
  return notificationCount;
}

function reloadNotifications () {
  getNotificationCount(updateNotificationCount);
}

function updateNotificationCount (notificationCount) {
  var counterElement = jQuery('#notificationCounter'),
      counterElementContainer = jQuery('#notification');
  var notificationString = '(' + notificationCount + ')';

  document.title = notificationCount > 0 ? (notificationString + ' ' + urlTitle) : urlTitle;

  if (notificationCount > 0) {
    counterElementContainer.addClass('new');
    counterElement.text(notificationString);
    counterElement.fadeIn();

    var notificationCountChanged = notificationCount != typedLocalStorage.getInteger('notificationCount');
    if (notificationCountChanged) {
      typedLocalStorage.setInteger('notificationCount', notificationCount);

      if (!!userSettings.notifications.desktopNotifications.enabled) {
        var notificationMessage = notificationString + (notificationCount !== 1 ? ' nuevas notificaciones' : ' nueva notificación') + '.';
        displayDesktopNotification(notificationMessage);
      }
      if (typedLocalStorage.getBoolean('notificationAlertEnabled')) {
        notificationAlertElement.get(0).play();
      }
    }

  } else {
    counterElementContainer.removeClass('new');
    counterElement.text('');
    counterElement.fadeOut();
  }

  counterElementContainer.find('img').attr('title', 'Notificaciones ' + notificationString);
}

function getNotificationCount (callback) {
  if (typeof callback === 'function') {
    var getNotificationCountFromDOM = function() {
      var response = jQuery(request.response);
      notificationCount = getNotificationsCountFromString(jQuery('#notification > img', response).attr('title'));
      callback(notificationCount);
    };

    var request = new XMLHttpRequest();
    request.open('GET', 'https://naruho.do/settings/account', true);
    request.onload = getNotificationCountFromDOM;
    request.send();
  }
}

function displayDesktopNotification (notificationMessage) {
  if (desktopNotification) {
    desktopNotification.close();
  }

  desktopNotification = new Notification('Naruho.do', {
    icon: NOTIFICATION.ICON,
    tag: 'naruhodo-notification-count',
    body: notificationMessage
  });

  desktopNotification.onclick = function () {
    window.open('http://naruho.do/notifications');
  };

  if (userSettings.notifications.desktopNotifications.fadeOut) {
    setTimeout(function() {
      desktopNotification.close();
    }, 1000 * userSettings.notifications.desktopNotifications.fadeOut);
  }

  jQuery('.ndo-notify[src*="notifications"]').click(function() {
    desktopNotification.close();
    jQuery('#notificationCounter').text('');
  });
}
unsafeWindow.displayDesktopNotification = displayDesktopNotification;

function subscribeToPusher () {
  toastrSettings = {
    "closeButton": true,
    "debug": false,
    "positionClass": "toast-bottom-left",
    "onclick": null,
    "showDuration": "2000",
    "hideDuration": "2000",
    "timeOut": "10000",
    "extendedTimeOut": "2000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  var pusher = new Pusher('e395a595b8053003640f', { encrypted: true });

  pusher.subscribe('user_notifications_178').bind('naruho_notification', function (notification) {
    processPusherNotification(notification);
  });

  pusher.subscribe('naruhodo_general').bind('user_notifications_0', function (notification) {
    processPusherNotification(notification);
  });
}

function processPusherNotification (notification) {
  var message = notification.message;
  var link = jQuery('<span>').html(message).find('a').attr('href');
  reloadNotifications();
  toastrSettings.onclick = function () {
    window.open(link);
  };
  toastr.success(message, "Notifications", toastrSettings);
}


/* Misc */

function removeSpaces (string) {
  return string.replace(/ /g, '');
}

function uppercaseWords (string) {
  return string.replace(/\w\S*/g, function (text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
  });
}

function getElementType (element) {
  return element !== null ? element.tagName : '';
}

function isAnImage (element) {
  return element.width > 1 && element.height > 1;
}

function scrollToTop () {
  window.scrollTo(0, 0);
}


/* Initialization */

function loadStyle () {
  var deferred = jQuery.Deferred();

  jQuery.get(URLS.STYLE).then(function(content) {
    var style = content + 'img.mt_thumbnail { max-width: ' + userSettings.imageParsing.dimensionLimits.width + '; max-height: ' + userSettings.imageParsing.dimensionLimits.height + '; }';

    if (userSettings.emoticons.enabled) {
      style += '.emoticons-container img { width: ' + (100 / emoticons.colCount) + '%; }';
    }

    jQuery('<style class="mt_style">' + style + '</style>').appendTo('head');

    deferred.resolve(content);
  });

  return deferred.promise();
}

function loadEmojiMapping () {
  jQuery.getJSON(URLS.TEXT_TO_EMOJI_MAPPING, function(content) {
    TEXT_TO_EMOJI_MAPPING = content;
  });
}

function overrideMethods (html) {
  ndo.actions.delete = function (event) {
    event.preventDefault();

    var parentsSelector = '[id^="ndo-message-"], [id^="ndo-comment-"]';
    var parent = jQuery(this).parents(parentsSelector).eq(0),
        obj = jQuery(this);

    debugger;
    if (!obj.attr('loading') && (event.ctrlKey || confirm(CONFIRM_FEED_DELETION))) {
      obj.attr('loading', 1);
      parent.addClass('waiting');

      jQuery.get(this.href).then(function (data) {
        jQuery(data.node).remove();
      });
    }
  };

  html.find('.actions > a.delete').each(function (i, element) {
    element = jQuery(element);
    element.parents('[id^="ndo-message-"], [id^="ndo-comment-"]').addClass('own');

    if (element.unbind) {
      element.unbind().click(ndo.actions.delete);
    }
  });

  ndo.actions.share = function (event) {
    event.preventDefault();

    var parentSelector = '[id^="ndo-message-"]';
    var parent = jQuery(this).parents(parentSelector).eq(0),
        obj = jQuery(this);
    var username = parent.find('.user a').eq(0).text();

    if (this.href != '#' && !obj.hasClass('selected') && !obj.attr('loading') && (event.ctrlKey || confirm(CONFIRM_FEED_SHARING + username + '?'))) {
      obj.attr('loading', 1);
      parent.addClass('waiting');

      jQuery.post(this.href).then(function (data) {
        obj.children('nobr').html('('+ data.count + ')');
        obj.attr('href', '#').unbind('click').click(function (e) { e.preventDefault(); });
        obj.addClass('selected');
        obj.removeAttr('loading');
        parent.removeClass('waiting');
      });
    }
  };

  html.find('.share').unbind().click(ndo.actions.share);

  ndo.events.feeds = function (html) {
    html = html.replace(/{filterHtml}/g, '');
    html = jQuery(html);

    html.find('.ndo-simple-form').unbind().submit(ndo.forms.simple);
    html.find('.actions>a.delete').unbind().click(ndo.actions.delete);
    html.find('.like').unbind().click(ndo.actions.like);
    html.find('.favorite').unbind().click(ndo.actions.favorite);
    html.find('.vote a').unbind().click(ndo.actions.votes);
    html.find('.more-comments').unbind().click(ndo.actions.loadMore);
    html.find('.zoom a').unbind().click(ndo.fancybox.imageZoom);
    html.find('.display-this-media').unbind().click(ndo.actions.showMedia);

    parseMedia(html);

    return html;
  };
}

function prepareDOM () {
  if (['/', '/es/'].indexOf(window.location.pathname) > -1) {
    var reloadIconHtml = jQuery('<div id="feedReloadIcon" class="icon"><img src="https://cdn.naruho.do/feed_uploads/8nZjhS.png" title="Recargar Feeds"></div>');
    reloadIconHtml.click(reloadFeeds);
    jQuery('#friends_request').before(reloadIconHtml);
  }

  if (!!userSettings.feeds.limitNumber) {
    jQuery('.load-more').click(removeCurrentFeeds);
  }
  jQuery('.load-more').click(function () {
    var time = parseInt(this.href.split('/')[4]);
    saveFeedTimeToURL(time);
  });

  var feedTime = location.href.split('/')[3].split('?time=')[1];
  if (feedTime) loadFeedsFromTime(feedTime);

  jQuery('textarea').keyup(function () {
    var textarea = jQuery(this);
    var height = this.scrollHeight, minHeight = 22;
    if (height < minHeight) height = minHeight;

    if (parseInt(textarea.css('height')) < height) textarea.css('height', height);
  });

  jQuery('textarea').keydown(function (event) {
    if (event.ctrlKey && event.keyCode == 13) {
      jQuery(this).parents('form').find('[type="submit"], [type="button"].submit').click();
    }
  });


  /* ------------- */

  /* Notifications */
  if (userSettings.notifications.reloadEnabled) {

    // Contador de notificaciones
    jQuery('#notification > .ua-box').after('<span id="notificationCounter">');
    updateNotificationCount(notificationCount, true);
    setInterval(reloadNotifications, userSettings.notifications.reloadInterval * 1000);

    var audioUrl = userSettings.notifications.soundAlert;
    if (audioUrl) {
      notificationAlertElement = jQuery('<audio></audio>').attr('src', audioUrl);

      // Botón de deshabilitar alerta
      jQuery('#user_actions > ul > .items').prepend('<div id="toggleNotificationSound" class="icon"><img src="https://cdn.naruho.do/feed_uploads/8kW8O7.png" title="Mute alert sounds"></div>');
      jQuery('#toggleNotificationSound').click(function() {
        var enabled = typedLocalStorage.toggleBoolean('notificationAlertEnabled');

        if (enabled) {
          jQuery(this).attr('title', 'Desactivar sonido de alerta de las notificaciones');
          jQuery(this).css('opacity', '1');
        } else {
          jQuery(this).attr('title', 'Activar sonido de alerta de las notificaciones');
          jQuery(this).css('opacity', '.5');
        }
      }).click().click();
    }

    // Fix del bug de que las notificaciones de amistades queden marcadas sin leer
    jQuery('#friends_request').click(function() {
      jQuery(this).removeClass('new');
    });

    // Anclaje al canal de notificaciones nativo de Naruho.do
    // subscribeToPusher();
  }
}

function addLinksSection(html) {
  const links = jQuery(`
    <div class="box hashtag">
      <strong class="subtitle"><span style="border-bottom: 4px solid #b0d568;">Enlaces</span></strong><br>
    </div>
  `);
  links.append(`<a href="https://discord.gg/hN5uzaS">Discord (no oficial)</a>`);
  links.append(`<a href="https://t.me/joinchat/FO1oBgoE_kdBdlFNn_vZjQ">Telegram (no oficial)</a>`);
  jQuery(html).find('#feeds-rightBlock').append(links);
  /* jQuery(html).find('#feeds-rightBlock').append(`<iframe src="https://discordapp.com/widget?id=397108239927607297&amp;theme=dark" height="480" allowtransparency="true" frameborder="0" style="margin:0;border:0;width:100%"></iframe>`); */
}

/*function setupMenu () {
    GM_registerMenuCommand('Naruho.do - Configuración', function () {
        GM_openInTab('http://metaltxus.altervista.org/misc/naruho.do/', false);
    });
}*/



function initialize () {
  console.debug(CONSOLE_NAME + 'Comenzando inicialización del script...');

  /*var storedSettings = typedLocalStorage.getJSON('userSettings');
  if (storedSettings) {
      userSettings = storedSettings;
  } else {
      typedLocalStorage.setJSON('userSettings', userSettings);
  }*/
  unsafeWindow.userSettings = userSettings;

  emoticons = EMOTICONS[userSettings.emoticons.type];
  delete EMOTICONS;

  urlTitle = document.title;
  notificationCount = getNotificationsCountFromString(jQuery('#notification > img').attr('title'));

  overrideMethods(jQuery('body'));

  addLinksSection(jQuery('body'));

  loadStyle().then(function () {
    parseMedia(jQuery('body'));

    var desktopNotificationsEnabled = userSettings.notifications.desktopNotifications.enabled;
    if (!!desktopNotificationsEnabled && Notification.permission !== "granted") {
      Notification.requestPermission();
    } else if (!Notification) {
      userSettings.notifications.desktopNotifications.enabled = false;
    }

    var soundAlertEnabled = userSettings.notifications.soundAlert !== false;
    if (!typedLocalStorage.hasLength('notificationAlertEnabled')) {
      typedLocalStorage.setBoolean('notificationAlertEnabled', soundAlertEnabled);
    }

    prepareDOM();
    //setupMenu(); Disabled because FUCKING FIREFOX

    console.debug(CONSOLE_NAME + 'La inicialización del script ha finalizado');
  });

  loadEmojiMapping();
}

initialize();

/* <iframe src="http://metaltxus.altervista.org/misc/naruho.do/settings/"></iframe> */

/* Reload: https://cdn.naruho.do/feed_uploads/8nZjhS.png */
/* Note:   https://cdn.naruho.do/feed_uploads/8kW8O7.png */
/* Cog:    https://cdn.naruho.do/feed_uploads/maQNi7.png */