import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// nested object destructure from an SE-bearing IIFE host: usage-global injects for the resolved
// constructor key while keeping the runtime shape untouched
let calls = 0;
const {
  Array: {
    from
  }
} = (() => {
  calls++;
  return globalThis;
})();