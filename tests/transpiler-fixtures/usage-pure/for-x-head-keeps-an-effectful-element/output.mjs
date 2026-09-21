import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// A for-x head has no statement slot: the declaration twin leaves an effectful receiver standing
// where it is written and binds the leaf beside it, while the head's only route is the mirror, which
// REPLACES the element. Refusing every effect there lost the polyfill on each invocation spelling.
// The element rides as the sequence PREFIX of the literal that takes its place, so it runs as often
// and as early as the source runs it and keeps its throw - only the value the mirror replaces is
// dropped. A read inside that prefix still owes its own substitution.
const log = [];
function make(seen) {
  _pushMaybeArray(log).call(log, seen);
  return Array;
}
function tag() {
  return Array;
}
for (const {
  from
} of [(make(0), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
for (const {
  of
} of [(tag`x`, {
  of: _Array$of
})]) _pushMaybeArray(log).call(log, typeof of);
for (const {
  from
} of [(make.call(null, 1), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
for (const {
  from
} of [(make.apply(null, [2]), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
for (const {
  from
} of [(_Reflect$apply(make, null, [3]), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
for (const {
  from
} of [(make.bind(null, 4)(), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
// the prefix is not quarantined: the global it reads is substituted like any other
for (const {
  from
} of [(make(_Object$assign({}, {
  tag: 5
})), {
  from: _Array$from
})]) _pushMaybeArray(log).call(log, typeof from);
// NEGATIVE: a slot the literal cannot spell needs the receiver's live value, and the head has
// nowhere to memo it - so a partial pattern and a rest both stay native over the effect
for (const {
  from,
  absent
} of [(make(6), {
  from: _Array$from,
  absent: Array.absent
})]) _pushMaybeArray(log).call(log, typeof from, typeof absent);
for (const _ref of [make(7)]) {
  let from = _Array$from;
  let {
    from: _unused,
    ...rest
  } = _ref;
  _pushMaybeArray(log).call(log, typeof from, 'from' in rest);
}
export { log };