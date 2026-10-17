import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// a function a block declares binds its name in that block, and the cases of a switch share one block,
// so a presence test or a written value reading that name inside reads the local binding, not the
// global: the test decides nothing, and the write stores the local value
export function element() {
  const list = [[1]];
  {
    function Reflect() {}
    if (typeof Reflect == 'object') list[0] = 'abc';
    return list[0].includes(1);
  }
}