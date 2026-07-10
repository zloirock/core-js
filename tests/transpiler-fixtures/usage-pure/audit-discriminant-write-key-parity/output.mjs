import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// discriminant-narrow write invalidation mirrors the READ side: an aliased computed
// write key resolves through the same scope-aware resolver, and a cast-wrapped write
// host peels its wrappers - both flips must drop the variant narrow (the retained
// Array narrow threw on the flipped variant's string, ie:11)
type Freight = {
  kind: 'a';
  data: number[];
} | {
  kind: 'b';
  data: string;
};
const KEY = 'kind';
export function viaComputedWrite(box: Freight) {
  if (box.kind === 'a') {
    var _ref;
    box[KEY] = 'b';
    return _at(_ref = box.data).call(_ref, 0);
  }
}
export function viaCastWrite(box: Freight) {
  if (box.kind === 'a') {
    var _ref2;
    (box as any).kind = 'b';
    return _includes(_ref2 = box.data).call(_ref2, 1);
  }
}

// a write-free guard keeps the variant narrow
export function viaCleanGuard(box: Freight) {
  if (box.kind === 'a') {
    var _ref3;
    return _atMaybeArray(_ref3 = box.data).call(_ref3, 0);
  }
}