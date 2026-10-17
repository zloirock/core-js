import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// an IIFE param-default whose winning call-arg is shadowed by an inner var of the same name
// still resolves the arg's static at the call site (`Promise.try`)
export const viaIifeDefault = (({
  try: attempt
} = Array) => {
  var Promise;
  return attempt;
})(Promise);