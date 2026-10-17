import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// An undecided selection keeps the prefixed Array receiver branch-local. The pure-read prefix may be
// discarded only with its selected receiver; either arm still supplies the Array.from polyfill.
export function read(flag) {
  const {
    from
  } = flag ? Array : (globalThis.marker, globalThis.self).Array;
  return from;
}