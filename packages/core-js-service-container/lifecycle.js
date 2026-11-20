import report from './report.js';

async function observe(promise) {
  try {
    return { result: await promise };
  } catch (error) {
    return { error };
  }
}

export default function createLifecycle({ load, createService, log, retryManifestRead = false }) {
  let started;
  let state = 'started';
  let serveScript;
  let fullyWarmed = false;
  let errorCode;

  function fail(code, detail) {
    state = 'error';
    errorCode = code;
    report(() => log(code, detail), `service container ${ code }`, detail);
  }

  async function prepare() {
    let modules;
    try {
      modules = await load();
    } catch (error) {
      if (retryManifestRead && typeof error?.syscall === 'string') {
        if (errorCode !== 'manifest_unavailable') fail('manifest_unavailable', error);
        return false;
      }
      fail('manifest_invalid', error);
      return;
    }

    if (errorCode === 'manifest_unavailable') {
      state = 'started';
      errorCode = undefined;
    }

    let service;
    try {
      service = createService(modules);
    } catch (error) {
      fail('plan_failed', error);
      return;
    }

    let ready;
    let warmed;
    try {
      ({ ready, warmed } = service.start());
    } catch (error) {
      fail('baseline_build_failed', error);
      return;
    }

    // Observe both promises before waiting: warm-up can reject before the baseline settles.
    const warmOutcome = observe(warmed);

    try {
      await ready;
    } catch (error) {
      fail('baseline_build_failed', error);
      return;
    }

    serveScript = (...args) => service.serveScript(...args);
    state = 'ready';
    const outcome = await warmOutcome;
    if ('error' in outcome) {
      fail('bundle_build_failed', outcome.error);
    } else if (outcome.result.failed.length) {
      fail('bundle_build_failed', outcome.result.failed);
    } else {
      fullyWarmed = true;
    }
  }

  return {
    status() {
      return {
        state,
        baselineReady: serveScript !== undefined,
        fullyWarmed,
        ...errorCode === undefined ? {} : { errorCode },
      };
    },
    start() {
      started ??= (async () => {
        const result = await prepare();
        if (result === false) started = undefined;
        return result;
      })();
      return started;
    },
    get serveScript() {
      return serveScript;
    },
  };
}
