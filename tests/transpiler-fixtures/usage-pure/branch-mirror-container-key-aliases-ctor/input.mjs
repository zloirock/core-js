// A static container is free to hold a constructor under a key of its own (`{ O: Object }` read as
// `O`). The receiver WALK names the constructor there, and the literal keeps the source's key while
// filling it with that constructor's statics - asking the key to equal the name declined a root the
// mirror spells perfectly well. A computed key that folds past an effect names the same hop its
// dotted spelling does, and the effect stays in the pattern where the source wrote it.
const src = { O: Object, A: Array };
let gate = 1;
let se = 0;
let keys, from, dotted;
({ [(se += 1, 'O')]: { keys } } = gate && src);
({ [(se += 1, 'O')]: { keys: dotted }, [(se += 1, 'A')]: { from } } = gate && src);
export { keys, from, dotted, se };
