import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a for-of / for-in head DECLARES the binding it rebinds per iteration: that rebind is the binding's
// own value source, not a reassignment beyond its declaration, so the binding stays constant and a
// typeof guard in the body narrows it to the tested family. the narrowing is read off the ABSENCE
// of the Array twins: a guard that stops narrowing brings `es.array.at` / `es.array.includes` back,
// so no row may spend a two-family method on anything but its own guard
declare const xs: any[];
declare const o: Record<string, unknown>;
export function guardedOf() {
  for (const s of xs) {
    if (typeof s === 'string') return _atMaybeString(s).call(s, 0);
  }
}
export function guardedIn() {
  for (const k in o) {
    if (typeof k === 'string') return _includesMaybeString(k).call(k, 'x');
  }
}