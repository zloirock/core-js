import "core-js/modules/es.global-this";
// Only the known realm slot is supplied. Native siblings keep their read order
// around the unknown child's key, including when that key throws.
const {
  before,
  globalThis: {
    [unknownKey()]: {
      prototype
    }
  },
  after
} = globalThis;