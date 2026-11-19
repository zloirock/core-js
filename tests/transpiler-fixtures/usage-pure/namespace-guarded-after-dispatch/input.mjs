// A private capture stays private after an earlier nested extraction drains.
const log = [];
namespace N {
  export const { array: { at: first }, realm: { WeakSet: Value }, tail } = {
    array: [41],
    get realm() { log.push(typeof first); return globalThis; },
    get tail() { log.push(typeof Value); return 3; },
  };
}
N;
