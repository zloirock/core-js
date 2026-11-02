import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The known argument and the receiver default are served independently.
// A caller's custom value still reaches the native pattern unchanged.
function read({
  globalThis: {
    Array: {
      from
    }
  }
} = globalThis) {
  return from([7]);
}
read();
read(globalThis);
read({
  globalThis: {
    Array: {
      from: () => [17]
    }
  }
});