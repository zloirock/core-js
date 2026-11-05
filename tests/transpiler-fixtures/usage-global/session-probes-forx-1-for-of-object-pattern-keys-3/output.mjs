import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested loop aliases retain the literal wrapper and its native nested static read.
{
  for (const _r of [{
    w: Object
  }]) for (const _s of [_r]) {
    let {
      w: {
        keys
      }
    } = _s;
    keys;
  }
}