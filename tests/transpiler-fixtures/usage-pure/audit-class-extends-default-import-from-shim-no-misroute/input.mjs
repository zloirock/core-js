// Default import `Promise` from a user shim must shadow the global; `super.try` cannot route to the polyfill.
// Only injector-registered (core-js) imports may pass through to the global-name dispatch path.
import Promise from './my-promise-shim';

class C extends Promise {
  static run() {
    return super.try(() => 1);
  }
}

C.run();
