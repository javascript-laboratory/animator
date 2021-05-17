import Animator, { startAnimation, MAX_FPS_DELAY } from '../';

describe('Animation loop tests', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.spyOn(Animator.prototype, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, MAX_FPS_DELAY));
  });

  describe('A subscribed handler should be called after the frame duration since the animation starts', () => {
    test.each([60, 40, 50, 30])('in %i FPS', fps => {
      const mockHandler = jest.fn();

      startAnimation(mockHandler, { fps });

      jest.setSystemTime(Date.now() + 1000 / fps);
      jest.runOnlyPendingTimers();

      expect(mockHandler).toBeCalled();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
});

describe('onStart event tests', () => {
  it('A subscribed handler should be called while starting an un-started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.onStart(mockHandler);
    animator.start();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should not be called while starting an already-started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.onStart(mockHandler);
    animator.start();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should not be called while starting a paused animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.onStart(mockHandler);
    animator.start();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should not be called while starting a resumed animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.resume();
    animator.onStart(mockHandler);
    animator.start();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should be called while starting a stopped animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.stop();
    animator.onStart(mockHandler);
    animator.start();

    expect(mockHandler).toBeCalled();
  });
});

describe('onPause event tests', () => {
  it('A subscribed handler should not be called while pausing an un-started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.onPause(mockHandler);
    animator.pause();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should be called while pausing a started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.onPause(mockHandler);
    animator.pause();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should not be called while pausing an already-paused animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.onPause(mockHandler);
    animator.pause();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should be called while pausing a resumed animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.resume();
    animator.onPause(mockHandler);
    animator.pause();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should not be called while pausing a stopped animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.stop();
    animator.onPause(mockHandler);
    animator.pause();

    expect(mockHandler).not.toBeCalled();
  });
});

describe('onResume event tests', () => {
  it('A subscribed handler should not be called while resuming an un-started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.onResume(mockHandler);
    animator.resume();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should not be called while resuming a started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.onResume(mockHandler);
    animator.resume();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should be called while resuming a paused animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.onResume(mockHandler);
    animator.resume();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should not be called while resuming an already-resumed animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.resume();
    animator.onResume(mockHandler);
    animator.resume();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should not be called while resuming a stopped animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.stop();
    animator.onResume(mockHandler);
    animator.resume();

    expect(mockHandler).not.toBeCalled();
  });
});

describe('onStop event tests', () => {
  it('A subscribed handler should not be called while stopping an un-started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.onStop(mockHandler);
    animator.stop();

    expect(mockHandler).not.toBeCalled();
  });

  it('A subscribed handler should be called while stopping a started animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.onStop(mockHandler);
    animator.stop();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should be called while stopping an paused animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.onStop(mockHandler);
    animator.stop();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should be called while stopping an resumed animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.pause();
    animator.resume();
    animator.onStop(mockHandler);
    animator.stop();

    expect(mockHandler).toBeCalled();
  });

  it('A subscribed handler should not be called while stopping an already-stopped animator', () => {
    const mockHandler = jest.fn();
    const animator = new Animator();

    animator.start();
    animator.stop();
    animator.onStop(mockHandler);
    animator.stop();

    expect(mockHandler).not.toBeCalled();
  });
});
