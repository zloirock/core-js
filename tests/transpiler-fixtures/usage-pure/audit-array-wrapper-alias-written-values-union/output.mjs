import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
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
  viaLoop = [_Promise];
  const [{
    allSettled
  }] = viaLoop;
  _pushMaybeArray(loopWrite).call(loopWrite, allSettled);
}
let viaTry = [Array];
try {
  viaTry = [_Reflect];
} catch (e) {
  void e;
}
const [{
  ownKeys
}] = viaTry;
export const tryWrite = ownKeys({});