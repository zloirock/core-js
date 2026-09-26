// `export default class X extends Y` with body shadowing globals via locals: shadowed
// references inside the class body skip pure-mode polyfill emission.
export default class Map {}
new Map();