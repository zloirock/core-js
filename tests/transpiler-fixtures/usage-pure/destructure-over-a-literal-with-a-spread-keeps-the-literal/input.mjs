// A selecting slot retains its literal so every spread effect finishes before the method read.
// A constant slot keeps its existing shared receiver rather than copying that literal.
export const { w: { at: a } } = { ...spread, w: c ? [1] : [2] };
export const { v: { flat: b } } = { ...other, v: [1] };
