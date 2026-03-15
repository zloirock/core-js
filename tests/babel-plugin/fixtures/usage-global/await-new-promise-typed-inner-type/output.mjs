import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.trim-start";
async function f() {
  (await new Promise<string>(r => r(''))).at(0).trimStart();
}