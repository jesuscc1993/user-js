(() => {
  'use strict';

  const setUpKeyNavigation = ({
    onDownPressed,
    onLeftPressed,
    onRightPressed,
    onUpPressed,
    preventDefault,
    stopPropagation,
  }) => {
    const handler = (event) => {
      const operation = {
        ArrowDown: (e) => executeFn(onDownPressed, e),
        ArrowLeft: (e) => executeFn(onLeftPressed, e),
        ArrowRight: (e) => executeFn(onRightPressed, e),
        ArrowUp: (e) => executeFn(onUpPressed, e),
      }[event.key];

      if (operation) operation(event);

      preventDefault && event.preventDefault();
      stopPropagation && event.stopPropagation();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  };

  const setUpAnchorNavigation = (selectorsMap) => {
    const downHref = getAnchorHref(selectorsMap.down);
    const leftHref = getAnchorHref(selectorsMap.left);
    const rightHref = getAnchorHref(selectorsMap.right);
    const upHref = getAnchorHref(selectorsMap.up);

    return setUpKeyNavigation({
      onDownPressed: generateNavigationEvent(downHref),
      onLeftPressed: generateNavigationEvent(leftHref),
      onRightPressed: generateNavigationEvent(rightHref),
      onUpPressed: generateNavigationEvent(upHref),
    });
  };

  const setUpMouseNavigation = ({
    onForwardPressed,
    onBackwardPressed,
    preventDefault,
    stopPropagation,
  }) => {
    const handler = (event) => {
      const operation = {
        3: (e) => executeFn(onBackwardPressed, e),
        4: (e) => executeFn(onForwardPressed, e),
      }[event.button];

      if (operation) operation(event);

      preventDefault && event.preventDefault();
      stopPropagation && event.stopPropagation();
    };

    window.addEventListener('mouseup', handler, true);
    return () => window.removeEventListener('mouseup', handler, true);
  };

  const getElement = (selector) => {
    return selector ? document.querySelector(selector) : undefined;
  };

  const getAnchorHref = (selector) => {
    return getElement(selector)?.href;
  };

  const generateNavigationEvent = (href) => {
    return href ? () => (location.href = href) : undefined;
  };

  const executeFn = (fn, ...parameters) => {
    return typeof fn === 'function' && fn(...parameters);
  };

  window.setUpAnchorNavigation = setUpAnchorNavigation;
  window.setUpKeyNavigation = setUpKeyNavigation;
  window.setUpMouseNavigation = setUpMouseNavigation;
})();
