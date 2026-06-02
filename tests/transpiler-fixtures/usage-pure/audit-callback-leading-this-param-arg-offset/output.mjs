import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The callback's `this: void` is a pseudo-parameter, not a real argument slot. `batch` is the
// first real parameter, typed `T[]` = `number[]`, so `.at` gets the array-specific polyfill.
// Without dropping the `this` slot, `batch` would line up with `this` (void) and fall through
// to the generic variant.
interface EventBus<T> {
  subscribe(handler: (this: void, batch: T[]) => void): void;
}
declare const bus: EventBus<number>;
bus.subscribe(function (batch) {
  _atMaybeArray(batch).call(batch, -1);
});