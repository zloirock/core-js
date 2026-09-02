import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
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
// an array-wrapper alias reassigned on a path the read may take - a closure that ran, a conditional,
// a loop body, a try block - can hold the written array at the destructure: usage-global unions the
// written values' leaves beside the live init, exactly as it unions a reassigned OBJECT container,
// so each written constructor's static injects. usage-pure substitutes only a provable value and
// keeps every one of these native

let viaClosure = [Array];
const setClosure = () => {
  viaClosure = [Object];
};
setClosure();
const [{
  fromEntries
}] = viaClosure;
export const closureWrite = fromEntries([]);
let viaBranch = [Object];
if (c) viaBranch = [Array];
const [{
  from
}] = viaBranch;
export const conditionalWrite = from('ab');
let viaLoop = [Array];
export const loopWrite = [];
for (let i = 0; i < 2; i++) {
  viaLoop = [Promise];
  const [{
    allSettled
  }] = viaLoop;
  loopWrite.push(allSettled);
}
let viaTry = [Array];
try {
  viaTry = [Reflect];
} catch (e) {
  void e;
}
const [{
  ownKeys
}] = viaTry;
export const tryWrite = ownKeys({});