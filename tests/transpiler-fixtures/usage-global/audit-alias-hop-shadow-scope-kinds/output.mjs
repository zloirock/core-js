import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// each row: an alias chain whose middle hop is shadowed by a DIFFERENT kind of scope. distinct
// static per row so the usage-global import set attributes every row on its own

// catch param
const catchRoot = Array;
const catchLink = catchRoot;
export function viaCatchShadow() {
  try {
    boom();
  } catch (catchRoot) {
    const {
      of
    } = catchLink;
    return of(1);
  }
}

// for-statement head
const forRoot = Array;
const forLink = forRoot;
export function viaForHeadShadow() {
  for (let forRoot = 0; forRoot < 1; forRoot++) {
    const {
      from
    } = forLink;
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
        const {
          groupBy
        } = switchLink;
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
    const {
      try: attempt
    } = staticLink;
    ViaStaticBlockShadow.v = attempt;
  }
}

// labeled block
const labelRoot = Promise;
const labelLink = labelRoot;
export function viaLabeledShadow() {
  tail: {
    const labelRoot = {};
    const {
      allSettled
    } = labelLink;
    return allSettled([]);
  }
}

// arrow param
const arrowRoot = Map;
const arrowLink = arrowRoot;
export const viaArrowParamShadow = arrowRoot2 => {
  const {
    groupBy
  } = arrowLink;
  return groupBy([], v => v);
};