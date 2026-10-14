import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// a guarded receiver reading a probe run on tests the environment probe alone: every realm hop
// past the probe names the realm the probe read, so a second test of one re-tests the same value -
// with a backed hop after it or none, and through a seal. a member of its own `?.` past the run
// is a value of its own
export const noBackedHop = globalThis.window?.window?.Array.of(2).flat();
export const unbackedOverBacked = globalThis.window?.self.window?.Array.from([3]).findLast(x => x);
export const deepRun = globalThis.window?.window?.window?.Object.values({
  v: 4
}).includes(4);
export const plainReadOff = globalThis.window?.window?.box.at(0);
export const sealedRun = globalThis.window?.self.window?.Object.entries({
  e: 5
}).flatMap(x => x);
export const ownOptional = globalThis.window?.window?.list?.findLastIndex(x => x);