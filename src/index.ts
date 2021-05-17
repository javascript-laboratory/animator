type CallbackEvent = () => void;
type AnimateEvent = (delta: number) => void;

type WindowAnimationListener = {
  onShow: CallbackEvent;
  onHidden: CallbackEvent;
};

type AnimatorParams = { fps?: number; pauseOnHidden?: boolean; resumeOnShown?: boolean };

declare global {
  interface Window {
    mozRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    oRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    msRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  }

  interface Document {
    mozHidden: boolean;
    webkitHidden: boolean;
    msHidden: boolean;
    onfocusin: CallbackEvent;
    onfocusout: CallbackEvent;
  }
}

export const MAX_FPS = 60;

export const MAX_FPS_DELAY = 1000 / MAX_FPS;

const windowListeners: WindowAnimationListener[] = [];

/** Set the request animation frame to the native event frame. */
const requestAnimationFrame: (callback: FrameRequestCallback) => number = (() =>
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (callback => setTimeout(callback, MAX_FPS_DELAY)))();

/** Perform action for window change event, either hidden or show */
const onWindowChange = (isWindowHidden: boolean) => (isWindowHidden ? onWindowHidden() : onWindowShow());

const onWindowHidden = () => {
  for (const { onHidden } of windowListeners) {
    onHidden();
  }
};

const onWindowShow = () => {
  for (const { onShow } of windowListeners) {
    onShow();
  }
};

/** Adapt visibility change on the window for pausing and resuming. */
/* Chrome 13+. */
document.addEventListener('visibilitychange', () => onWindowChange(document.hidden));

/* Firefox 10+. */
document.addEventListener('mozvisibilitychange', () => onWindowChange(document.mozHidden));

/* Opera 12.10+. */
document.addEventListener('webkitvisibilitychange', () => onWindowChange(document.webkitHidden));

/* Internet Explorer 10+. */
document.addEventListener('msvisibilitychange', () => onWindowChange(document.msHidden));

/* Internet Explorer 9 and lower. */
document.onfocusin = () => onWindowShow();
document.onfocusout = () => onWindowHidden();

/* Other. */
window.onpageshow = window.onfocus = () => onWindowShow();
window.onpagehide = window.onblur = () => onWindowHidden();

export default class Animator {
  /* The target frame rate of the animation in terms of frames per seconds, by default is the maximum 60 FPS. */
  private targetFPS: number;

  /* The flag for determining whether the animations should be paused when the browser window loses focus. */
  private pauseOnHidden: boolean;

  /* The flag for determining whether the animations should be resume when the browser window gains focus. */
  private resumeOnShown: boolean;

  /* The flag for determining whether to ignore the target FPS and perform purely on animation frame requests. */
  private ignoreTargetFPS: boolean;

  /* The actual frame rate of the animation performed in terms of frames per seconds. */
  private performingFPS = 0;

  /* The starting time of the animation. */
  private startTime = 0;

  /* The previous time which the animate functions were called. */
  private previousAnimateTime = 0;

  /* The flag for determining whether the animator is paused. */
  private isPaused = false;

  /* The flag for determining whether the animator is commanded to pause externally. */
  private isPauseRequested = false;

  /* The animate listeners that are registered to this animator to trigger on each requestAnimFrame event. */
  private animateEvents: AnimateEvent[] = [];

  /* The list of animator events. Each animator event will trigger the corresponding method of each listeners. */
  private startEvents: CallbackEvent[] = [];
  private pauseEvents: CallbackEvent[] = [];
  private resumeEvents: CallbackEvent[] = [];
  private stopEvents: CallbackEvent[] = [];

  constructor({ fps, pauseOnHidden = true, resumeOnShown = true }: AnimatorParams = {}) {
    this.targetFPS = fps ? fps : MAX_FPS;
    this.pauseOnHidden = pauseOnHidden;
    this.resumeOnShown = resumeOnShown;
    this.ignoreTargetFPS = !fps;

    /* Add a listener to the window to handle hide and show events. */
    windowListeners.push({
      onShow: () => this.onShow(),
      onHidden: () => this.onHidden(),
    });
  }

  private addEvent<T>(event: T, events: T[]) {
    events.push(event);
    return () => this.removeEvent(event, events);
  }

  private removeEvent<T>(event: T, events: T[]) {
    const index = events.indexOf(event);

    if (index !== -1) {
      events.splice(index, 1);
    }
  }

  private onHidden() {
    if (this.pauseOnHidden) {
      this.isPauseRequested = true;
      this.pause();
    }
  }

  private onShow() {
    if (this.resumeOnShown) {
      this.isPauseRequested = false;
      this.resume();
    }
  }

  /** The iteration of the animation loop, each call depends on the animation frame of the browser. */
  private animate() {
    /* Check if the animations are paused or the frame rate is equal or below 0. */
    if (this.targetFPS > 0 && !this.isPaused && this.startTime > 0) {
      /* Request for the next animation frame. */
      this.requestAnimationFrame(() => this.animate());

      /* Calculate the time difference between now and the previous timestamp. */
      const currentTime = Date.now();
      const delta = currentTime - this.previousAnimateTime;
      const delay = 1000 / this.targetFPS;

      if (this.ignoreTargetFPS || delta >= delay) {
        /* Update the current performing FPS. */
        this.performingFPS = 1000 / delta;

        /* Trigger all animate listeners from the animator. */
        this.animateEvents.forEach(event => event(delta));

        /* Update the the timestamps with the new timestamp of the animation. */
        this.previousAnimateTime = currentTime;
      }
    }
  }

  /**
   * Initiate an animation frame request.
   * @param callback
   */
  requestAnimationFrame(callback: FrameRequestCallback) {
    requestAnimationFrame(callback);
  }

  /**
   * Get the current performing frame rate for the animation.
   * @returns the current performing FPS
   */
  getPerformingFPS() {
    return this.performingFPS;
  }

  /**
   * Set a target frame rate for the animation.
   * @param fps
   */
  setTargetFPS(fps: number) {
    this.targetFPS = Math.min(fps, MAX_FPS);
  }

  /**
   * Subscribe a handler to the animation event.
   * @param animateEvent
   * @returns a method to unsubscribe
   */
  add(animateEvent: AnimateEvent) {
    return this.addEvent(animateEvent, this.animateEvents);
  }

  /**
   * Set whether the animations to be paused when the page loses focus.
   * @param pauseOnHidden
   */
  setPauseOnHidden(pauseOnHidden: boolean) {
    this.pauseOnHidden = pauseOnHidden;
  }

  /**
   * Set whether the animations to be resume when the page regains focus.
   * @param resumeOnShown
   */
  setResumeOnShown(resumeOnShown: boolean) {
    this.resumeOnShown = resumeOnShown;
  }

  /**
   * Start the animation loop.
   */
  start() {
    if (this.startTime === 0) {
      const currentTime = Date.now();

      /* Record the timestamp of the starting animation. */
      this.startTime = currentTime;

      /* Record the previous animation timestamp as the starting animation to avoid time difference surge. */
      this.previousAnimateTime = currentTime;

      this.startEvents.forEach(event => event());

      /* Start the animation loop. */
      this.animate();
    }
  }

  /**
   * Pause the animation loop.
   */
  pause() {
    if (this.startTime > 0 && !this.isPaused) {
      this.isPaused = true;
      this.pauseEvents.forEach(event => event());
    }
  }

  /**
   * Resume the animation loop.
   */
  resume() {
    if (!this.isPauseRequested && this.isPaused) {
      this.isPaused = false;
      this.resumeEvents.forEach(event => event());

      /* Record the previous animation timestamp as the starting animation to avoid time difference surge. */
      this.previousAnimateTime = Date.now();

      /* Re-initiate the animation loop. */
      this.animate();
    }
  }

  /**
   * Stop the animation loop.
   */
  stop() {
    if (this.startTime > 0) {
      this.startTime = 0;
      this.isPaused = false;
      this.stopEvents.forEach(event => event());
    }
  }

  /**
   * Subscribe a handler to the start events.
   * @param startEvent
   * @returns a method to unsubscribe
   */
  onStart(startEvent: CallbackEvent) {
    return this.addEvent(startEvent, this.startEvents);
  }

  /**
   * Subscribe a handler to the pause events.
   * @param pauseEvent
   * @returns a method to unsubscribe
   */
  onPause(pauseEvent: CallbackEvent) {
    return this.addEvent(pauseEvent, this.pauseEvents);
  }

  /**
   * Subscribe a handler to the resume events.
   * @param resumeEvent
   * @returns a method to unsubscribe
   */
  onResume(resumeEvent: CallbackEvent) {
    return this.addEvent(resumeEvent, this.resumeEvents);
  }

  /**
   * Subscribe a handler to the stop events.
   * @param resumeEvent
   * @returns a method to unsubscribe
   */
  onStop(stopEvent: CallbackEvent) {
    return this.addEvent(stopEvent, this.stopEvents);
  }
}

export const startAnimation = (animateEvent: AnimateEvent, params?: AnimatorParams) => {
  const animator = new Animator(params);

  animator.add(animateEvent);
  animator.start();

  return animator;
};
