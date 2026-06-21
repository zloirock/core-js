// declaration-merged Thenable: `class Foo {}` + `interface Foo { then(...) }`. resolving the
// reference finds the class, but a class-body + superClass walk cannot see the merged interface
// members, so the `then` lookup misses. the structural Thenable peel must fall through to the
// interface path (which includes merged-iface members) instead of bailing, landing on string[]
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
