import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of / for-in head DECLARES the binding it rebinds per iteration: that rebind is the binding's
// own value source, not a reassignment beyond its declaration, so the binding stays constant and a
// typeof guard in the body narrows it to the tested family. the narrowing is read off the ABSENCE
// of the Array twins: a guard that stops narrowing brings `es.array.at` / `es.array.includes` back,
// so no row may spend a two-family method on anything but its own guard
declare const xs: any[];
declare const o: Record<string, unknown>;
export function guardedOf() {
  for (const s of xs) {
    if (typeof s === 'string') return s.at(0);
  }
}
export function guardedIn() {
  for (const k in o) {
    if (typeof k === 'string') return k.includes('x');
  }
}