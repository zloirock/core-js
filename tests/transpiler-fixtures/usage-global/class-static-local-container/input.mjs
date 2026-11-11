// An aliased local class is not the built-in with the same spelling.
// Its own static method must remain a user call.
const effects = [];
export const result = (() => {
class Map { static groupBy() { return "user"; } } const box = { C: Map }; return box.C.groupBy([3], x => x);
})();
