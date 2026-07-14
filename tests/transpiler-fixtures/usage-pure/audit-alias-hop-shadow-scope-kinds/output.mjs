import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// each row: an alias chain whose middle hop is shadowed by a DIFFERENT kind of scope. distinct
// static per row so the usage-global import set attributes every row on its own

// catch param
const catchRoot = Array;
const catchLink = catchRoot;
export function viaCatchShadow() {
  try {
    boom();
  } catch (catchRoot) {
    const of = _Array$of;
    return of(1);
  }
}

// for-statement head
const forRoot = Array;
const forLink = forRoot;
export function viaForHeadShadow() {
  for (let forRoot = 0; forRoot < 1; forRoot++) {
    const from = _Array$from;
    return from([1]);
  }
}

// switch-case block
const switchRoot = Object;
const switchLink = switchRoot;
export function viaSwitchCaseShadow(x) {
  switch (x) {
    case 1:
      {
        let switchRoot = {};
        const groupBy = _Object$groupBy;
        return groupBy([], v => v);
      }
  }
}

// class static block
const staticRoot = _Promise;
const staticLink = staticRoot;
export class ViaStaticBlockShadow {
  static {
    const staticRoot = {};
    const attempt = _Promise$try;
    ViaStaticBlockShadow.v = attempt;
  }
}

// labeled block
const labelRoot = _Promise;
const labelLink = labelRoot;
export function viaLabeledShadow() {
  tail: {
    const labelRoot = {};
    const allSettled = _Promise$allSettled;
    return allSettled([]);
  }
}

// arrow param
const arrowRoot = _Map;
const arrowLink = arrowRoot;
export const viaArrowParamShadow = arrowRoot2 => {
  const groupBy = _Map$groupBy;
  return groupBy([], v => v);
};