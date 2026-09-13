import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// When every arm assigns the realm, the alias permits a direct static fold.
// Mixed or missing arms and shadowed realm names provide only candidates: pure keeps
// the constructor read behind an identity guard. A later overwrite prevents direct
// folding too. Distinct static methods keep these decisions independently observable.
export function bothArmsName(flag) {
  if (flag) {
    var G = globalThis;
  } else {
    var G = self;
  }
  return G.Array.from([2]);
}
export function bothArmsDestructure(flag) {
  if (flag) {
    var H = globalThis;
  } else {
    var H = self;
  }
  const {
    Object: {
      entries
    }
  } = H;
  return entries({
    a: 1
  });
}
// negatives
export function oneArmIsNotTheRealm(flag) {
  if (flag) {
    var N = globalThis;
  } else {
    var N = {};
  }
  return N.Array.of(3);
}
export function noAlternate(flag) {
  if (flag) {
    var L = globalThis;
  }
  return L.Object.assign({}, {
    b: 2
  });
}
export function armShadowsTheRealmName(flag) {
  if (flag) {
    const globalThis = {};
    var S = globalThis;
  } else {
    var S = self;
  }
  return S.Object.getOwnPropertyNames({
    c: 3
  });
}
export function writtenAgainAfterThePair(flag) {
  if (flag) {
    var W = globalThis;
  } else {
    var W = self;
  }
  if (flag) W = {};
  return W.Object.freeze({
    d: 4
  });
}