import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.trim-end";
async function f(p: Promise<string>) {
  (await p.finally(() => {})).at(0).trimEnd();
}