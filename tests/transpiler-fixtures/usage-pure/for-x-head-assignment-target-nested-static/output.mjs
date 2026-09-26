import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a for-x HEAD that declares NOTHING destructures into bindings that already exist, and it still
// holds no statement for an extraction to land in: the iterated ELEMENT is the pattern's only slot,
// so a pattern-valued static leaf takes the same mirror the declaring head takes. a branching
// element mirrors per arm, and an element that is not the constructor keeps the source's own read
let via, span;
const branch = eff();
for ({
  of: {
    name: via
  }
} of [{
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
}, {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
}]) eff(via);
for ({
  of: {
    name: {
      length: span
    }
  }
} of [{
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
}]) eff(span);
for ({
  from: {
    name: via
  }
} of [branch ? {
  from: {
    name: _nameMaybeFunction(_Array$from)
  }
} : {
  from: {
    name: 'CUSTOM'
  }
}]) eff(via);

// a claim-free nested level reads the ponyfill the same way
for ({
  fromEntries: {
    length: span
  }
} of [{
  fromEntries: _Object$fromEntries
}]) eff(span);

// ... and an element spelling a plain object declines the whole head
for (const _ref of [{
  groupBy: {
    name: 'CUSTOM'
  }
}]) {
  ({
    groupBy: {
      name: via
    }
  } = _ref);
  eff(via);
}

// The call runs once before the loop binds the nested static.
function make() {
  eff();
  return Array;
}
for ({
  of: {
    name: via
  }
} of [(make(), {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
})]) eff(via);