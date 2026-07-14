// each row: an alias chain whose middle hop is shadowed by a DIFFERENT kind of scope. distinct
// static per row so the usage-global import set attributes every row on its own

// catch param
const catchRoot = Array;
const catchLink = catchRoot;
export function viaCatchShadow() {
  try { boom(); } catch (catchRoot) {
    const { of } = catchLink;
    return of(1);
  }
}

// for-statement head
const forRoot = Array;
const forLink = forRoot;
export function viaForHeadShadow() {
  for (let forRoot = 0; forRoot < 1; forRoot++) {
    const { from } = forLink;
    return from([1]);
  }
}

// switch-case block
const switchRoot = Object;
const switchLink = switchRoot;
export function viaSwitchCaseShadow(x) {
  switch (x) {
    case 1: {
      let switchRoot = {};
      const { groupBy } = switchLink;
      return groupBy([], v => v);
    }
  }
}

// class static block
const staticRoot = Promise;
const staticLink = staticRoot;
export class ViaStaticBlockShadow {
  static {
    const staticRoot = {};
    const { try: attempt } = staticLink;
    ViaStaticBlockShadow.v = attempt;
  }
}

// labeled block
const labelRoot = Promise;
const labelLink = labelRoot;
export function viaLabeledShadow() {
  tail: {
    const labelRoot = {};
    const { allSettled } = labelLink;
    return allSettled([]);
  }
}

// arrow param
const arrowRoot = Map;
const arrowLink = arrowRoot;
export const viaArrowParamShadow = arrowRoot2 => {
  const { groupBy } = arrowLink;
  return groupBy([], v => v);
};
