import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
// 3-level nested static descent. wrapper holds nested ObjectExpression `{a: {b: {c: Array}}}`.
// `planOuterPropStatic` recurses through path accumulator [a] -> [a, b] -> [a, b, c]. each
// failed walkStaticReceiverChain call descends one level via foldNestedPattern, until the
// final hop resolves to Identifier 'Array'. distinct methods (at, includes, copyWithin)
// confirm body-extract alias registers per call site
const wrapper = {
  a: {
    b: {
      c: Array
    }
  }
};
const from = _Array$from;
const arr = from('xyz');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'y');
_copyWithinMaybeArray(arr).call(arr, 0, 1);