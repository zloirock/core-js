// An aliased local class is not the built-in with the same spelling.
// Its own static method must remain a user call.
const effects = [];
export const result = (() => {
  class Iterator {
    static from() {
      return "user";
    }
  }
  const I = Iterator;
  return I.from([3]);
})();