import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a function a block declares binds its name in that block, and the cases of a switch share one block,
// so a presence test or a written value reading that name inside reads the local binding, not the
// global: the test decides nothing, and the write stores the local value
export function element() {
  const list = [[1]];
  {
    var _ref;
    function Reflect() {}
    if (typeof Reflect == 'object') list[0] = 'abc';
    return _includes(_ref = list[0]).call(_ref, 1);
  }
}
export function settled(items) {
  let C = Array;
  {
    function Reflect() {}
    if (typeof Reflect == 'object') C = _Map;
    return (C === Array ? _Array$from : C.from.bind(C))(items);
  }
}
export function sibling(kind) {
  var _ref2;
  const list = [[1]];
  switch (kind) {
    case 1:
      let Reflect = 1;
      break;
    case 2:
      if (typeof Reflect == 'object') list[0] = 'abc';
      return _at(_ref2 = list[0]).call(_ref2, 0);
  }
}
export function written(tasks) {
  let C = _Set;
  {
    function Promise() {}
    Promise.allSettled = list => list;
    C = Promise;
  }
  return C.allSettled(tasks);
}