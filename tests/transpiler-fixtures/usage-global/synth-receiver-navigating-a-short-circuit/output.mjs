import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the same short-circuiting synth receivers under the method that only injects: what is locked here
// is that neither the nav nor the mirrored keys lose their module - one constructor per row so a
// dropped one is visible in the import set
export function overAHop({
  of,
  from
} = globalThis.window?.self.Array) {
  return [of, from];
}
export function unpolyfilledSibling({
  groupBy,
  other
} = globalThis.window?.Map) {
  return [groupBy, other];
}
export const viaIifeArgument = (({
  entries,
  other
}) => [entries, other])(globalThis.window?.self.Object);
export function directlyUnderTheGuard({
  of,
  other
} = globalThis.window?.Array) {
  return [of, other];
}