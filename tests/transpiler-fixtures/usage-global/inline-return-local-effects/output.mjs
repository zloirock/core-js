import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// A returned realm proves the outer static despite unrelated local declarations.
// Inject the outer static and methods used inside the retained body.
export const log = [];
export const value = (() => {
  const inner = [1, [2]].flat();
  log.push(inner.length);
  return globalThis;
})()?.Array.of(5).at(0);