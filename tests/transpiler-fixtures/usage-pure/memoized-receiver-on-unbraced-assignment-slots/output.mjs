import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an assignment-destructure whose receiver is memoized, in each unbraced control slot: the
// `_ref` declaration and the polyfill assignment reading it belong to ONE block. wrapping the
// slot again for the second insertion leaves the read outside the block that declares it
const obj = {
  list: [1, 2]
};
let a1, l1, a2, l2, a3, l3, a4, l4, a5, l5, a6, l6;
if (c1()) {
  const _ref = obj.list;
  a1 = _atMaybeArray(_ref);
  ({
    length: l1
  } = _ref);
}
if (!c2()) ;else {
  const _ref2 = obj.list;
  a2 = _atMaybeArray(_ref2);
  ({
    length: l2
  } = _ref2);
}
for (let i = 0; i < 1; i++) {
  const _ref3 = obj.list;
  a3 = _atMaybeArray(_ref3);
  ({
    length: l3
  } = _ref3);
}
for (const x of [1]) {
  const _ref4 = obj.list;
  a4 = _atMaybeArray(_ref4);
  ({
    length: l4
  } = _ref4);
}
for (const k in {
  a: 1
}) {
  const _ref5 = obj.list;
  a5 = _atMaybeArray(_ref5);
  ({
    length: l5
  } = _ref5);
}
do {
  const _ref6 = obj.list;
  a6 = _atMaybeArray(_ref6);
  ({
    length: l6
  } = _ref6);
} while (false);
console.log(a1, l1, a2, l2, a3, l3, a4, l4, a5, l5, a6, l6);