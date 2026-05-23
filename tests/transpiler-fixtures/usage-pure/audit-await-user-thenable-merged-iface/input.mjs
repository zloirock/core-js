// declaration-merged Thenable: `class Foo {}` + `interface Foo { then(...) }`.
// findClassPathForTypeReference returns the class, but findClassMember walks only the
// class body + superClass chain - merged interface members invisible. peelUserThenable
// previously bail'ed at `if (!found) return null;` without falling through to the
// interface-path. with the fall-through fix the structural Thenable peel proceeds via
// getTypeMembers which DOES include merged-iface members; narrow lands on string[]
class Foo<T> {}
interface Foo<T> {
  then(_cb: (v: T) => any, _e?: any): Foo<T>;
}
declare const t: Foo<string[]>;
async function go() {
  const arr = await t;
  arr.at(0);
}
go();
