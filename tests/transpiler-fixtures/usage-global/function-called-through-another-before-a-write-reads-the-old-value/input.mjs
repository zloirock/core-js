// a function declaration may run as early as its first use, and that use may itself stand in another
// function run early: a read in a helper another helper calls between two writes sees the first, which
// the second does not supersede - a computed key and a constructor read through such a chain
let mode;
mode = 'from';
export const initial = build([3]);
mode = 'of';
function build(args) {
  return create(args);
}
function create(args) {
  return Array[mode](args);
}
let Ctor;
Ctor = Iterator;
export const early = setup();
Ctor = Map;
function setup() {
  return run();
}
function run() {
  return Ctor.from([1]);
}
