import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Each default and source slot can write the same member target.
({
  self: {
    Array: {
      from: sink.method
    }
  } = {
    Array
  }
} = globalThis);
sink.method([3]);