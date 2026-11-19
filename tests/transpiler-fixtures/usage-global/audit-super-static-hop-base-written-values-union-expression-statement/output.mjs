import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
let closureNs = {
  Base: Boolean
};
const set = () => {
  closureNs = {
    Base: Promise
  };
};
set();