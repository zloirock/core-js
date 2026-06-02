import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The callback's method signature has NO leading `this` pseudo-parameter, so `batch` is already the
// first slot and is not dropped: it resolves to `T[]` = `number[]` and `.at` gets the array-specific
// polyfill. Confirms the this-param drop is a no-op when there is no `this` slot.
interface EventBus<T> {
  subscribe(handler: (batch: T[]) => void): void;
}
declare const bus: EventBus<number>;
bus.subscribe(function (batch) {
  _atMaybeArray(batch).call(batch, -1);
});