import _includes from "@core-js/pure/actual/instance/includes";
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