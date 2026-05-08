import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `keyof T` excludes `#private` members per TS spec; mapped expansion must skip them, not bail.
// Public members still produce concrete entries so the array narrow on `b.items.value` survives.
class Box {
  items: number[] = [1, 2, 3];
  #internal: string = 'hidden';
}

type Wrapped<T> = { [K in keyof T]: { value: T[K] } };
declare const b: Wrapped<Box>;
const arr = b.items.value;
const head = _atMaybeArray(arr).call(arr, 0);
export { head };