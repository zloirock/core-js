import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop writes a replacement constructor into an array alias before a nested pattern reads it.
// The raw static read needs the whole pure entry on the substituted value.
let viaLoop = [Array];
export const loopWrite = [];
for (let i = 0; i < 2; i++) {
  viaLoop = [Promise];
  const [{
    allSettled
  }] = viaLoop;
  loopWrite.push(allSettled);
}