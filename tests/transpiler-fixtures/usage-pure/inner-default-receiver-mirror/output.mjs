import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A receiver-bearing INNER default (`[{ from } = Array]`, `{ k: { from } = Array }`) names the arm the
// outer slot leaves open, and the live arm is whatever the slot holds. Where the host spells the live
// receiver - the iterated elements of a for-x head, an IIFE argument, a literal init - the shared plan
// mirrors both arms: every defined element in place, and the default itself for the passes whose slot
// provably holds `undefined` (absent key, hole, a key spelled `undefined`). A slot nothing proves (a call) keeps its
// native read and only the default is swapped, so a user object arriving there survives; a slot that
// proves a value (a binding holding the user's literal) never fires the default, which stays as
// written; a slot the pairing proves `undefined` still takes the declaration rename. Both legs read
// one plan.
const out = [];
const pick = () => ({
  from: () => [7]
});
for (const [{
  from
} = {
  from: _Array$from
}] of [[undefined]]) _pushMaybeArray(out).call(out, from([1]).length);
for (const [{
  from
} = {
  from: _Array$from
}, tail] of [[undefined, 1], [{
  from: _Array$from
}, 2]]) _pushMaybeArray(out).call(out, from([1]).length + tail);
for (const [{
  from
} = {
  from: _Array$from
}] of [[], [{
  from: _Array$from
}]]) _pushMaybeArray(out).call(out, from([1]).length);
for (const [[{
  from
} = {
  from: _Array$from
}]] of [[[undefined]]]) _pushMaybeArray(out).call(out, from([1]).length);
for (const {
  k: {
    from
  } = {
    from: _Array$from
  }
} of [{}, {
  k: {
    from: _Array$from
  }
}]) _pushMaybeArray(out).call(out, from([1]).length);
for (const {
  k: [{
    from
  } = {
    from: _Array$from
  }]
} of [{
  k: [undefined]
}]) _pushMaybeArray(out).call(out, from([1]).length);
for (const [{
  groupBy
} = {
  groupBy: _Map$groupBy
}] of [[undefined]]) _pushMaybeArray(out).call(out, groupBy([1, 2], x => x % 2).size);
for (const [{
  from
} = {
  from: _Array$from
}] of [[pick()]]) _pushMaybeArray(out).call(out, from([1])[0]);
const src = [[undefined]];
for (const [{
  from
} = {
  from: _Array$from
}] of src) _pushMaybeArray(out).call(out, from([1]).length);
const [{
  from: dynamicFrom
} = {
  from: _Array$from
}] = [pick()];
const [{
  from: dynamicSibling
} = {
  from: _Array$from
}, count] = [pick(), 1];
const keyedFrom = _Array$from;
const {
  k: {
    from: keyedAbsent
  } = {
    from: _Array$from
  }
} = {
  k: undefined
};
for (const {
  k: {
    from
  } = {
    from: _Array$from
  }
} of [{
  k: undefined
}, {
  k: {
    from: _Array$from
  }
}]) _pushMaybeArray(out).call(out, from([1]).length);
let assigned;
[{
  from: assigned
} = {
  from: _Array$from
}] = [pick()];
try {
  throw [undefined];
} catch ([{
  from: caught
} = {
  from: _Array$from
}]) {
  _pushMaybeArray(out).call(out, caught([1]).length);
}
(({
  k: {
    from
  } = {
    from: _Array$from
  }
}) => _pushMaybeArray(out).call(out, from([1]).length))({
  k: {
    from: _Array$from
  }
});
const held = {
  from: () => [7]
};
const [{
  from: heldFrom
} = Array] = [held];
export { out, dynamicFrom, dynamicSibling, count, keyedFrom, keyedAbsent, assigned, heldFrom };