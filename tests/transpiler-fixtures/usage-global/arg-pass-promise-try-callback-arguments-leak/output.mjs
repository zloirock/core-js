import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// `Promise.try(fn, ...args)` calls `fn` with the arguments after it, so a holder passed there reaches
// code that may rewrite its field and keeps no narrow; in the callback slot itself it is only called
export function viaArgument(fn) {
  const holder = {
    items: [1, 2]
  };
  Promise.try(fn, holder);
  return holder.items.at(0);
}
export function viaCallback() {
  const holder = {
    items: [1, 2]
  };
  Promise.try(holder);
  return holder.items.includes(1);
}