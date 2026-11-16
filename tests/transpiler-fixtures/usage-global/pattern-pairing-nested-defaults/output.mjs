import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Every supplied or default receiver keeps its own read.
const {
  self: {
    self: {
      Array: {
        from
      }
    } = {
      self: globalThis
    }
  } = {
    self: globalThis
  }
} = globalThis;
from([3]);