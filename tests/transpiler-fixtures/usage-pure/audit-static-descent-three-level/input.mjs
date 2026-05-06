// 3-level nested static descent. wrapper holds nested ObjectExpression `{a: {b: {c: Array}}}`.
// `planOuterPropStatic` recurses through path accumulator [a] -> [a, b] -> [a, b, c]. each
// failed walkStaticReceiverChain call descends one level via foldNestedPattern, until the
// final hop resolves to Identifier 'Array'. distinct methods (at, includes, copyWithin)
// confirm body-extract alias registers per call site
const wrapper = { a: { b: { c: Array } } };
const { a: { b: { c: { from } } } } = wrapper;
const arr = from('xyz');
arr.at(0);
arr.includes('y');
arr.copyWithin(0, 1);
