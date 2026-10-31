// an optional call of a static the build serves reads a pure import, defined on every engine, so its guard
// is dead - whether the read runs ahead of every write of its global or no write of the global ever runs,
// spelled off the global or inherited in a static method. a static the file deletes keeps its guard
export const last = Array.from?.(list).at(-1);
if (isBrowser) window.Array = ArrayShim;
if (typeof Object == 'undefined') window.Object = ObjectShim;
export const lastEntry = Object.entries?.(dict).at(-1);
export class Bag extends Object {
  static lastEntry(dict) { return super.entries?.(dict).at(-1); }
}
delete String.raw;
export const lastChar = String.raw?.(template).at(-1);
