import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a namespace's declaration is a binding apart from a namesake outside it, in either order: a dispatching
// prototype installed on the namespace's object leaves the outer array the array family. distinct method
// per line
namespace First {
  const a = {};
  Object.setPrototypeOf(a, String.prototype);
}
const a = [1, 2];
use(a.includes(2));
const b = [1, 2];
namespace Second {
  const b = {};
  Object.setPrototypeOf(b, String.prototype);
}
use(b.at(-1));