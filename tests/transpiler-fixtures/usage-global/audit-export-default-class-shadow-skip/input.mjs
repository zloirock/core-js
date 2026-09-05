// `export default class X extends Y` body shadows globals via locals: shadowed
// references inside the class body skip polyfill emission.
export default class Map {}
new Map();
