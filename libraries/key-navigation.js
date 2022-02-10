(() => {
  'use strict';

  const KEYS = {
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN',
  };

  const setUpKeyNavigation = ({
    onDownPressed,
    onLeftPressed,
    onRightPressed,
    onUpPressed,
    preventDefault,
    stopPropagation,
  }) => {
    document.addEventListener('keydown', event => {
      const eventKey = KEYS[event.which];

      const operation = {
        DOWN: e => executeFn(onDownPressed, e),
        LEFT: e => executeFn(onLeftPressed, e),
        RIGHT: e => executeFn(onRightPressed, e),
        UP: e => executeFn(onUpPressed, e),
      }[eventKey];
      operation && operation(event);

      preventDefault && event.preventDefault();
      stopPropagation && event.stopPropagation();
    });
  };

  const executeFn = (fn, ...parameters) => {
    return typeof fn === 'function' && fn(...parameters);
  };

  window.setUpKeyNavigation = setUpKeyNavigation;
})();