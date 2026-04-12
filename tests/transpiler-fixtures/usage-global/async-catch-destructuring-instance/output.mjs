import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
async function f() {
  try {
    await g();
  } catch ({
    includes
  }) {
    includes("x");
  }
}