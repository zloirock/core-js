// A retained getter supplies a nested constructor between ordinary siblings.
// Its binding initializes before either trailing getter reads it.
// The exported constructor includes its static methods for external consumers.
const log = [];
export const { before, box: { first, realm: { WeakSet: Value }, last }, after } = {
  get before() { log.push('before'); return 1; },
  get box() {
    log.push('box');
    return {
      get first() { log.push('first'); return 2; },
      get realm() { log.push('realm'); return globalThis; },
      get last() { log.push(typeof Value); return 3; },
    };
  },
  get after() { log.push(typeof Value); return 4; },
};
export { log };
