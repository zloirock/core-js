// discriminant-narrow write invalidation mirrors the READ side: an aliased computed
// write key resolves through the same scope-aware resolver, and a cast-wrapped write
// host peels its wrappers - both flips must drop the variant narrow (the retained
// Array narrow threw on the flipped variant's string, ie:11)
type Freight = { kind: 'a'; data: number[]; } | { kind: 'b'; data: string; };
const KEY = 'kind';

export function viaComputedWrite(box: Freight) {
  if (box.kind === 'a') {
    box[KEY] = 'b';
    return box.data.at(0);
  }
}

export function viaCastWrite(box: Freight) {
  if (box.kind === 'a') {
    (box as any).kind = 'b';
    return box.data.includes(1);
  }
}

// a write-free guard keeps the variant narrow
export function viaCleanGuard(box: Freight) {
  if (box.kind === 'a') {
    return box.data.at(0);
  }
}
