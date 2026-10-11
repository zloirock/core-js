import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a nested pattern over an undecided selection of containers reads the slot of whichever arm ran, so
// every arm's slot takes the static of the constructor it holds - declared, assigned or passed to a
// parameter - and an arm whose constructor has no such static keeps its own. a hop key read twice leaves
// the read native, and an arm that is no container is the raw branch of the guard over the arm that is
const {
  C: {
    groupBy
  }
} = flag ? {
  C: {
    groupBy: _Object$groupBy
  }
} : {
  C: {
    groupBy: _Map$groupBy
  }
};
export const declared = () => groupBy([1], x => x);
let from;
({
  C: {
    from
  }
} = flag ? {
  C: {
    from: _Array$from
  }
} : {
  C: {
    from: _Iterator$from
  }
});
export const assigned = () => from([1]);
function read({
  C: {
    of
  }
}) {
  return of;
}
export const passed = () => read(flag ? {
  C: (log(), {
    of: _Array$of
  })
} : {
  C: {
    of: _Array$of
  }
});
const {
  C: {
    try: attempt
  }
} = flag ? {
  C: {
    try: _Promise$try
  }
} : {
  C: Object
};
export const ownless = () => attempt(() => 1);
const {
  C: {
    withResolvers
  },
  C: held
} = flag ? {
  C: _Promise
} : {
  C: Object
};
export const readTwice = () => [withResolvers(), held];
const {
    C: _ref
  } = flag ? {
    C: Object
  } : user,
  fromEntries = _ref === Object ? _Object$fromEntries : _ref.fromEntries;
export const notContainer = () => fromEntries([]);