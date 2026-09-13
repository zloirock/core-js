import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
({
  Symbol,
  Array: {
    from
  },
  ...rest
} = _globalThis);
export const viaShorthandRest = [from([1]), rest];
let al;
({
  Iterator: al,
  ...others
} = _globalThis);
export const viaAliasedRest = [_Iterator.range(0, 3), others];