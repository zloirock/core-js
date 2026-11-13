async function observe(promise) {
  try {
    return { result: await promise };
  } catch (error) {
    return { error };
  }
}

export default function createLifecycle({ load, createService, log }) {
  let service;
  let started;
  let state = 'started';
  let baselineReady = false;
  let fullyWarmed = false;
  let errorCode;

  function fail(code, detail) {
    state = 'error';
    errorCode = code;
    try {
      log(code, detail);
    } catch (loggingError) {
      try {
        process.stderr.write(`service container ${ code }: ${ detail }; logging failed: ${ loggingError }\n`);
      } catch {
        // No output channel remains; do not replace the recorded startup failure with a logging error.
      }
    }
  }

  async function prepare() {
    let modules;
    try {
      modules = await load();
    } catch (error) {
      fail('manifest_invalid', error);
      return;
    }

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

    baselineReady = true;
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
        baselineReady,
        fullyWarmed,
        ...errorCode === undefined ? {} : { errorCode },
      };
    },
    start() {
      if (!started) started = prepare();
      return started;
    },
    serveScript(...args) {
      if (baselineReady) return service.serveScript(...args);
    },
  };
}
