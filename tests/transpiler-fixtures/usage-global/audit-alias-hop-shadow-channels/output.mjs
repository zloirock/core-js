import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the alias-hop scope rule holds across every RESOLUTION CHANNEL, not just the plain static
// destructure: the symbol fold, the array-wrapped alias and the TS declaration forms each reach the
// receiver through their own walk and must agree on which scope a hop resolves in

// symbol fold through a shadowed hop - the well-known key still folds
const symRoot = Symbol;
const symLink = symRoot;
export function viaSymbolChain(symRoot) {
  const {
    iterator
  } = symLink;
  return [1][iterator];
}

// symbol fold where the shadow WINS (the var's init reads a block-local shadow) - no fold
const symVarRoot = Symbol;
export function viaSymbolVarShadow() {
  {
    const symVarRoot = {};
    var symHeld = symVarRoot;
  }
  {
    const {
      asyncIterator
    } = symHeld;
    return [1][asyncIterator];
  }
}

// array-WRAPPED alias whose hop is shadowed by a param
const wrapRoot = Array;
const wrapLink = wrapRoot;
export function viaArrayWrapChain(wrapRoot) {
  const [{
    from
  }] = [wrapLink];
  return from([1]);
}

// a namespace declaration in the file must not disturb the hop resolution
const nsRoot = Object;
const nsLink = nsRoot;
namespace SideNs {
  export const unrelated = 1;
}
export function viaNamespaceSibling(nsRoot) {
  const {
    fromEntries
  } = nsLink;
  return fromEntries([]);
}

// an AMBIENT `declare var` hop carries no known value - the chain stays unresolved
declare var ambientRoot: typeof Promise;
const ambientLink = ambientRoot;
export function viaAmbientHop() {
  const {
    allSettled
  } = ambientLink;
  return allSettled([]);
}

// an IMPORT hop could be any module value - the chain stays unresolved
import importedRoot from "./somewhere";
const importLink = importedRoot;
export function viaImportHop() {
  const {
    race
  } = importLink;
  return race([]);
}