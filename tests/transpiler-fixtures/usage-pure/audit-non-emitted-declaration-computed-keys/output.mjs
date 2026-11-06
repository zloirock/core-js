import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a computed key on a declaration that VANISHES from the emit is never computed: tsc erases the
// ambient class, the ambient namespace, the `declare` member and the `abstract` member whole, so
// the globals named in those keys must NOT be injected. each key takes its own global because the
// import set is the only observable here - a repeated one would let a live row cover a dead one.
// the runtime twins below carry the mirror claim: the same syntax on an EMITTED member injects
export declare class AmbientClass {
  [Map.name]: number;
}
export abstract class AbstractMember {
  abstract [WeakMap.name]: number;
}
export class DeclaredMember {
  declare [Promise.name]: number;
}
declare namespace AmbientNamespace {
  class Nested {
    [ArrayBuffer.name]: number;
  }
}
declare global {
  class GlobalAugmented {
    [Number.name]: number;
  }
}

// emitted twins - one global each, and every one of these MUST appear in the set above
export class LiveField {
  [_nameMaybeFunction(_Set)] = 1;
}
export abstract class LiveMemberOfAbstractClass {
  [_nameMaybeFunction(_WeakSet)] = 2;
}
export const liveObjectKey = {
  [_Symbol$asyncIterator]: 3
};