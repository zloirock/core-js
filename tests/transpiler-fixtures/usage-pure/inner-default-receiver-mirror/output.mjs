import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
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
const {
  k: {
    from: keyedFrom
  } = {
    from: _Array$from
  }
} = {
  k: {
    from: _Array$from
  }
};
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