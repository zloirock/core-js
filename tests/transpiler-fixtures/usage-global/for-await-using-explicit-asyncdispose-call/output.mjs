import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// stage-3 explicit-resource-management chain: `for await (await using r of asyncIter)`
// implicitly disposes via Symbol.asyncDispose, but user code may also explicitly invoke
// `r[Symbol.asyncDispose]()`. Both the for-await disposal scaffolding and the explicit
// computed-key call need their respective polyfills detected
async function main() {
  for await (await using r of asyncIter()) {
    await r[Symbol.asyncDispose]();
  }
}