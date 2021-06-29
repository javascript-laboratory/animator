"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAnimation = exports.MAX_FPS_DELAY = exports.MAX_FPS = void 0;
exports.MAX_FPS = 60;
exports.MAX_FPS_DELAY = 1000 / exports.MAX_FPS;
const windowListeners = [];
/** Set the request animation frame to the native event frame. */
const requestAnimationFrame = (() => window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (callback => setTimeout(callback, exports.MAX_FPS_DELAY)))();
/** Perform action for window change event, either hidden or show */
const onWindowChange = (isWindowHidden) => (isWindowHidden ? onWindowHidden() : onWindowShow());
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
class Animator {
    constructor({ fps, pauseOnHidden = true, resumeOnShown = true } = {}) {
        /* The actual frame rate of the animation performed in terms of frames per seconds. */
        this.performingFPS = 0;
        /* The starting time of the animation. */
        this.startTime = 0;
        /* The previous time which the animate functions were called. */
        this.previousAnimateTime = 0;
        /* The flag for determining whether the animator is paused. */
        this.isPaused = false;
        /* The flag for determining whether the animator is commanded to pause externally. */
        this.isPauseRequested = false;
        /* The animate listeners that are registered to this animator to trigger on each requestAnimFrame event. */
        this.animateEvents = [];
        /* The list of animator events. Each animator event will trigger the corresponding method of each listeners. */
        this.startEvents = [];
        this.pauseEvents = [];
        this.resumeEvents = [];
        this.stopEvents = [];
        this.targetFPS = fps ? Math.min(fps, exports.MAX_FPS) : exports.MAX_FPS;
        this.pauseOnHidden = pauseOnHidden;
        this.resumeOnShown = resumeOnShown;
        this.ignoreTargetFPS = !fps;
        /* Add a listener to the window to handle hide and show events. */
        windowListeners.push({
            onShow: () => this.onShow(),
            onHidden: () => this.onHidden(),
        });
    }
    addEvent(event, events) {
        events.push(event);
        return () => this.removeEvent(event, events);
    }
    removeEvent(event, events) {
        const index = events.indexOf(event);
        if (index !== -1) {
            events.splice(index, 1);
        }
    }
    onHidden() {
        if (this.pauseOnHidden) {
            this.isPauseRequested = true;
            this.pause();
        }
    }
    onShow() {
        if (this.resumeOnShown) {
            this.isPauseRequested = false;
            this.resume();
        }
    }
    /** The iteration of the animation loop, each call depends on the animation frame of the browser. */
    animate() {
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
    requestAnimationFrame(callback) {
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
    setTargetFPS(fps) {
        this.targetFPS = Math.min(fps, exports.MAX_FPS);
        this.ignoreTargetFPS = false;
    }
    /**
     * Set to ignore the target FPS and perform purely on animation frame requests.
     */
    setIgnoreTargetFPS() {
        this.ignoreTargetFPS = true;
    }
    /**
     * Subscribe a handler to the animation event.
     * @param animateEvent
     * @returns a method to unsubscribe
     */
    add(animateEvent) {
        return this.addEvent(animateEvent, this.animateEvents);
    }
    /**
     * Set whether the animations to be paused when the page loses focus.
     * @param pauseOnHidden
     */
    setPauseOnHidden(pauseOnHidden) {
        this.pauseOnHidden = pauseOnHidden;
    }
    /**
     * Set whether the animations to be resume when the page regains focus.
     * @param resumeOnShown
     */
    setResumeOnShown(resumeOnShown) {
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
    onStart(startEvent) {
        return this.addEvent(startEvent, this.startEvents);
    }
    /**
     * Subscribe a handler to the pause events.
     * @param pauseEvent
     * @returns a method to unsubscribe
     */
    onPause(pauseEvent) {
        return this.addEvent(pauseEvent, this.pauseEvents);
    }
    /**
     * Subscribe a handler to the resume events.
     * @param resumeEvent
     * @returns a method to unsubscribe
     */
    onResume(resumeEvent) {
        return this.addEvent(resumeEvent, this.resumeEvents);
    }
    /**
     * Subscribe a handler to the stop events.
     * @param resumeEvent
     * @returns a method to unsubscribe
     */
    onStop(stopEvent) {
        return this.addEvent(stopEvent, this.stopEvents);
    }
}
exports.default = Animator;
const startAnimation = (animateEvent, params) => {
    const animator = new Animator(params);
    animator.add(animateEvent);
    animator.start();
    return animator;
};
exports.startAnimation = startAnimation;
//# sourceMappingURL=index.js.map