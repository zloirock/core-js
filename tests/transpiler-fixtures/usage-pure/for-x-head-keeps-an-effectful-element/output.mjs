import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// The element producer runs at its source position, including its effects and throws.
// A retained pattern with rest reads its properties when the loop binds the element.
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
// The extra property is read from the returned receiver when its pattern slot is reached.
// A rest copies the remaining own properties of that same receiver.
for (const {
  from,
  absent
} of [(_ref => {
  return {
    from: _Array$from,
    get absent() {
      return _ref.absent;
    }
  };
})(make(6))]) _pushMaybeArray(log).call(log, typeof from, typeof absent);
for (const _ref2 of [make(7)]) {
  const from = _Array$from;
  const {
    from: _unused,
    ...rest
  } = _ref2;
  (_pushMaybeArray(log) || 0).call(log, typeof from, 'from' in rest);
}
export { log };