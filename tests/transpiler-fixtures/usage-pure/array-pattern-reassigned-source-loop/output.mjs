import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise";
// A loop writes a replacement constructor into an array alias before a nested pattern reads it.
// The raw static read needs the whole pure entry on the substituted value.
let viaLoop = [Array];
export const loopWrite = [];
for (let i = 0; i < 2; i++) {
  viaLoop = [_Promise];
  const [{
    allSettled
  }] = viaLoop;
  _pushMaybeArray(loopWrite).call(loopWrite, allSettled);
}