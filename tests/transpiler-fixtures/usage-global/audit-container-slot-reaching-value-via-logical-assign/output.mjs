import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// a logical assign installs its right operand only sometimes - still reachable
const cl = {
  q: Object
};
cl.q ||= Promise;
const {
  q: {
    try: viaLogicalAssign
  }
} = cl;
export { viaLogicalAssign };