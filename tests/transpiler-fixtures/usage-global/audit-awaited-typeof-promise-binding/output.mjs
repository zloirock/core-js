import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
// Awaited<typeof items> = Awaited<Promise<number[]>> = number[] - the typeof must resolve to
// the binding's Promise type and unwrap it, so x.at narrows to es.array.at (not generic)
declare const items: Promise<number[]>;
function process(x: Awaited<typeof items>) {
  x.at(0);
}