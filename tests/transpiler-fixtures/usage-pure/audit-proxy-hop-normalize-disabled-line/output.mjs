import _Array$from from "@core-js/pure/actual/array/from";
// a disabled line opts out of the normalization reshaping as well as the polyfills,
// while the sibling line keeps its own injection
// core-js-disable-next-line
const {
  Map: {
    groupBy
  }
} = globalThis;
// a MULTILINE disabled statement gates on its first line too
// core-js-disable-next-line
const {
  Promise: {
    allSettled
  }
} = globalThis;
// a disabled FOR-INIT line keeps the buried SE-init host fully raw (no fold, no root swap)
let dis, outD;
// core-js-disable-next-line
for (const {
  entries
} = ({
  self: {
    ondrop: dis
  }
} = globalThis, Object); !outD;) outD = entries;
export const r = _Array$from([groupBy, allSettled, dis, outD]);