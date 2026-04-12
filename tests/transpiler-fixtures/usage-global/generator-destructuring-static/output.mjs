import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
const gen = function* () {
  const {
    from
  } = Array;
  yield from([1]);
};