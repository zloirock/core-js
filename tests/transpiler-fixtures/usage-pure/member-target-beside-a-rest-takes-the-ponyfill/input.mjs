// A member target beside a rest takes the ponyfill like its binding twin, the rest keeping the key as a
// sentinel: on the host's own level the extraction writes into the slot, a key without a polyfill beside it and
// a dead default of the target included; one level down the hop capture writes it ahead of the rest copy.
const o = {};
let rest, rest2, rest3, rest4, c, c4;
({ values: o.v, ...rest } = Object);
({ fromEntries: o.f, custom: c, ...rest2 } = Object);
({ Array: { from: o.a, ...rest3 } } = globalThis);
({ entries: o.e = fallback, custom: c4, ...rest4 } = cond ? Object : self.Object);
