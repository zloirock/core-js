import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// usage-global parity: usage-global keeps the static member verbatim (it never collapses the receiver), so a
// chain-root call and a hop-key effect stay in source order automatically. this locks that a future change
// doesn't start collapsing + reordering them. polyfilled static leaf makes the import injection the visible
// transform; the buried side effects stay verbatim. mirrors the pure set: IIFE chain-root, and a bare root.
const log = [];
const callBeforeKey = (() => {
  log.push('call');
  return globalThis;
})()[log.push('key'), 'self'].Array.of(1);
const keyOnly = globalThis[log.push('k2'), 'self'].Array.from([2]);
export { callBeforeKey, keyOnly, log };