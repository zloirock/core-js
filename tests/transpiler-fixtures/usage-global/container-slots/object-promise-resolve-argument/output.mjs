import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// Promise.resolve receives the container before its nested constructor slot is read.
const escapedThroughPromiseResolve = function () {
  const awaitedBox = {
    k: Object
  };
  void Promise.resolve(awaitedBox);
  const {
    k: {
      entries
    }
  } = awaitedBox;
  return entries;
}();
export { escapedThroughPromiseResolve };