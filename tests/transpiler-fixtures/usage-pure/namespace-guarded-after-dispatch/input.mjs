// A private capture stays private after an earlier nested extraction drains.
const log = [];
namespace N {
  export const { array: { at: first }, realm: { WeakSet: Value }, tail } = {
    array: [41],
    get realm() { log.push(typeof first, typeof N.first); return globalThis; },
    get tail() { log.push(typeof Value, typeof N.Value); return 3; },
  };
}
N;
