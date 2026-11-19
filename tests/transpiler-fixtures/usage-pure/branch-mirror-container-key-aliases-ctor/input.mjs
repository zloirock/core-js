// A computed alias for a constructor slot keeps its key effect inside the pattern.
const src = { O: Object, A: Array };
let gate = 1;
let se = 0;
let keys, from, dotted;
({ [(se += 1, 'O')]: { keys } } = gate && src);
export { keys, from, dotted, se };
