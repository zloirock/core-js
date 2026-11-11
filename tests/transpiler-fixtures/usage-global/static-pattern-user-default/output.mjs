import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A default on the imported function property remains live.
export let value;
({
  from: {
    missing: value = fallback()
  }
} = Array);