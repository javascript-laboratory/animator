![Last Commit][github-last-commit-image]
[![Issues][issues-image]][issues-url]

[github-last-commit-image]: https://img.shields.io/github/last-commit/javascript-laboratory/animator?style=for-the-badge
[issues-image]: https://img.shields.io/github/issues/javascript-laboratory/animator.svg?style=for-the-badge
[issues-url]: https://github.com/javascript-laboratory/animator/issues

# Animator

A class for managing and controlling browser animations.

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of contents</summary>
  <ol>
    <li>
      <a href="#built-with">Built with</a>
    </li>
    <li>
      <a href="#methods">Methods</a>
    </li>
    <li>
      <a href="#contact">Contact</a>
    </li>
  </ol>
</details>

## Built with

- [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) (uses `setInterval` as fallback method if unavailable)
- [`visibilitychange` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)
- [`onfocus` handler](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onfocus)
- [`onblur` handler](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onblur)

## Methods

| Method               | Parameters                          | Description                                                                  | Returns                   |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| `getPerformingFPS`   |                                     | Get the current performing frame rate for the animation.                     | fps: `number`             |
| `setTargetFPS`       | fps: `number`                       | Set a target frame rate for the animation.                                   |
| `setIgnoreTargetFPS` |                                     | Set to ignore the target FPS and perform purely on animation frame requests. |
| `setPauseOnHidden`   | hidden: `boolean`                   | Set whether the animations to be paused when the page loses focus.           |
| `setResumeOnShown`   | shown: `boolean`                    | Set whether the animations to be resume when the page regains focus.         |
| `start`              |                                     | Start the animation loop.                                                    |
| `pause`              |                                     | Pause the animation loop.                                                    |
| `resume`             |                                     | Resume the animation loop.                                                   |
| `stop`               |                                     | Stop the animation loop.                                                     |
| `add`                | handler: `(delta: number) => void)` | Subscribe a handler to the animation event loop.                             | unsubscribe: `() => void` |
| `onStart`            | handler: `() => void`               | Subscribe a handler to the start events.                                     | unsubscribe: `() => void` |
| `onPause`            | handler: `() => void`               | Subscribe a handler to the pause events.                                     | unsubscribe: `() => void` |
| `onResume`           | handler: `() => void`               | Subscribe a handler to the resume events.                                    | unsubscribe: `() => void` |
| `onStop`             | handler: `() => void`               | Subscribe a handler to the stop events.                                      | unsubscribe: `() => void` |

## Contact

Wai Chung Wong - [Github](https://github.com/WaiChungWong) | [johnwongwwc@gmail.com](mailto:johnwongwwc@gmail.com)
