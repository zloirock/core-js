import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `typeof NS.foo.bar` 2-deep through ObjectExpression init: type-resolver должен walk'ить
// nested members через init shape. Bar - Array<number>, .at(0) должен dispatch'ить
// _atMaybeArray (array-narrowed)
const NS = {
  foo: {
    bar: [1, 2, 3]
  }
};
declare const x: typeof NS.foo.bar;
_atMaybeArray(x).call(x, 0);