import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop head assignment keeps the literal wrapper and its native nested static read.
{
  for (const _r of [{
    w: Object
  }]) {
    ({
      w: {
        keys
      }
    } = _r);
    keys;
  }
}