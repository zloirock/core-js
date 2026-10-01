// Renamed import `{ something as Promise }` shadows the global with an arbitrary local binding.
// `super.try` must stay untouched; only injector-registered core-js imports may route to a polyfill.
import { something as Promise } from './my-shim';
class C extends Promise {
  static run() {
    return super.try(() => 1);
  }
}
C.run();