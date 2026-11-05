// A getter reading the constructor binding it is about to initialize still throws in the TDZ.
// No later sibling getter may run after that abrupt completion.
const log = [];
let caught;
try {
  const { first, realm: { WeakSet: Value }, last } = {
    get first() { log.push('first'); return 1; },
    get realm() {
      log.push('realm');
      const type = typeof Value;
      log.push(type);
      return globalThis;
    },
    get last() { log.push('last'); return 2; },
  };
  log.push(first, last, Value);
} catch (error) {
  caught = error.name;
}
export const result = [caught, log];
