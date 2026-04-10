import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.at";
declare const x: string | number[];
if (typeof x === "string") {
  const fn = async function() { return x.at(-1); };
}