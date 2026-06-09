// an EXPORTED destructure with a side-effecting computed key (`from`, polyfilled -> extracted) NEXT TO a
// real non-polyfilled sibling binding (`isArray`, native for the target). the sibling MUST stay exported:
// the extracted polyfill becomes its own `export const f`, and the residual destructure keeps its export
// so `isArray` is still exported. regression: unplugin stole the `export` keyword for the extract and
// dropped the whole destructure - and `isArray` with it - out of the export; babel kept it. both agree now
export const { [(effectful(), 'from')]: f, isArray } = Array;
