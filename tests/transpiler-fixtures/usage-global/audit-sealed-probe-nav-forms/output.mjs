import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the sealed-probe nav forms the pure renders diverged on, seen from the method that only injects:
// nothing here is rewritten, so the observable is the import set - one distinct method per line, or
// the lines mask each other. what this locks is that a seal never hides a usage from detection
export const viaAbsorbedHopDelete = delete (globalThis.window?.self).self.box.at;
export const viaSealedCtorLeaf = (globalThis.window?.self).Map.name;
export const viaInOperand = Symbol.iterator in globalThis.window?.self;
const host = {
  box: {
    missing: null
  }
};
export const viaStartParenReceiver = (host.box?.missing).flat?.().includes(1);
export const {
  trunc: viaAllProxySource
} = (globalThis.window?.self).window;
const box = {
  get: () => [['a']]
};
export const viaFoldedChainStart = box.get?.()?.flatMap(x => x).findLast(Boolean);