// an instance claim through a nested nav in an assignment pattern, extracted as an assignment: when it
// consumes every slot the statement goes and the dispatch is the only read left, off the realm or off a
// user namespace. a top-level sibling keeps the host, not the slot; a rest keeps the pattern native, its
// claim included; an array wrapper captures its element first; a computed key keeps the slot running it.
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let dropped, kept, sibling, wrapped, computed, other, z;
({ Array: { prototype: { copyWithin: dropped } } } = globalThis);
({ Array: { prototype: { flat: kept } } } = userNs);
({ Array: { prototype: { at: sibling } }, z } = globalThis);
let rest;
({ Array: { prototype: { fill: other } }, ...rest } = globalThis);
[{ Array: { prototype: { flatMap: wrapped } } }] = [globalThis];
({ Array: { prototype: { [(effect(), 'includes')]: computed } } } = globalThis);
export { dropped, kept, sibling, other, rest, wrapped, computed, z };
