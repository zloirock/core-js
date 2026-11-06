import "core-js/modules/es.global-this";
// A visible replacement of the realm slot belongs to the user.
// An unknown child must not replace that written value with the realm ponyfill.
globalThis.globalThis = supplied;
const {
  globalThis: {
    [unknownKey()]: {
      prototype
    }
  },
  tail
} = globalThis;