import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
var _ref2;
// a nested pattern over an undecided selection of containers reads the slot of whichever arm ran, so
// every arm's slot takes the static of the constructor it holds - declared, assigned or passed to a
// parameter - and an arm whose constructor has no such static keeps its own. a hop key read twice leaves
// the read native, and an arm that is no container is the raw branch of the guard over the arm that is
const {
    C: _ref
  } = flag ? {
    C: Object
  } : {
    C: _Map
  },
  groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
export const declared = () => groupBy([1], x => x);
let from;
({
  C: _ref2
} = flag ? {
  C: Array
} : {
  C: _Iterator
}), from = _ref2 === Array ? _Array$from : _ref2.from;
export const assigned = () => from([1]);
function read({
  C: {
    of
  }
}) {
  return of;
}
export const passed = () => read(flag ? {
  C: (log(), Array)
} : {
  C: Array
});
const {
  C: {
    try: attempt
  }
} = flag ? {
  C: _Promise
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
    C: _ref3
  } = flag ? {
    C: Object
  } : user,
  fromEntries = _ref3 === Object ? _Object$fromEntries : _ref3.fromEntries;
export const notContainer = () => fromEntries([]);