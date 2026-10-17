import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$isSafeInteger from "@core-js/pure/actual/number/is-safe-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A residual-keeping destructure rebuilds a realm-read LEFT as a literal: a left the build serves (`Array`,
// `Object`, and `Number`, a global core-js extends in place) decides its selection alone, its right dead and
// its own effects in place; a caller default keeps the plain literal. A left the rebuild leaves possibly
// undefined (an arm it keeps raw), and a rebuilt RIGHT, keep the selection.
const {
  of,
  deep: {
    a
  }
} = {
  of: _Array$of,
  deep: Array.deep
};
const {
  fromEntries,
  deep: {
    b
  }
} = {
  fromEntries: _Object$fromEntries,
  deep: Object.deep
};
let from, c;
({
  from,
  deep: {
    c
  }
} = (log(), {
  from: _Array$from,
  deep: Array.deep
}));
const {
  fromAsync,
  deep: {
    d
  }
} = (flag ? {
  fromAsync: _Array$fromAsync,
  deep: Array.deep
} : _globalThis.WeakRef) || Fallback;
const {
  groupBy,
  deep: {
    e
  }
} = _globalThis.WeakRef || {
  groupBy: _Object$groupBy,
  deep: Object.deep
};
export function pick({
  hasOwn,
  deep: {
    f
  }
} = {
  hasOwn: _Object$hasOwn,
  deep: Object.deep
}) {
  return [hasOwn, f];
}
export { of, a, fromEntries, b, from, c, fromAsync, d, groupBy, e };
const {
  isInteger,
  deep: {
    g
  }
} = {
  isInteger: _Number$isInteger,
  deep: Number.deep
};
const {
  isFinite,
  deep: {
    h
  }
} = {
  isFinite: _Number$isFinite,
  deep: Number.deep
};
let parseFloat, i;
({
  parseFloat,
  deep: {
    i
  }
} = (log(), {
  parseFloat: _Number$parseFloat,
  deep: Number.deep
}));
export function pickNumber({
  isSafeInteger,
  deep: {
    j
  }
} = {
  isSafeInteger: _Number$isSafeInteger,
  deep: Number.deep
}) {
  return [isSafeInteger, j];
}
export { isInteger, g, isFinite, h, parseFloat, i };