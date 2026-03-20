import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
async function foo(p: Promise<{
  key: string;
}>) {
  Object.freeze(await p);
}