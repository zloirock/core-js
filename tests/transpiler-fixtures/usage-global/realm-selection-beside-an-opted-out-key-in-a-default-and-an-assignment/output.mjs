import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A realm selection destructured beside a key the author opts out of, as a parameter default and assigned:
// the other keys load their statics, the opted-out one nothing.
export function opt({
  Array: {
    from: fr,
    // core-js-disable-next-line
    of
  }
} = c ? globalThis : fb) {
  return [fr, of];
}
let fe, oe;
({
  Object: {
    fromEntries: fe,
    // core-js-disable-next-line
    entries: oe
  }
} = c ? globalThis : fb);