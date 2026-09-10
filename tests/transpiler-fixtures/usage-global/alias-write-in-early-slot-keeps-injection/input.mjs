// the container-order refusal is a usage-pure rule: pure drops the receiver, so a read that runs
// before its alias write must stay raw. usage-global rewrites nothing and injects side-effect
// imports only, so the same key read - evaluated ahead of the static block that writes the alias -
// still pulls its module
let M;
class C {
  static { ({ Map: M } = globalThis); }
  static [(M.groupBy([1], x => x), 'k')]() {}
}
export default C;
