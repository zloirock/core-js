import _at from "@core-js/pure/actual/instance/at";
// class extends cycle A ↔ B — mirrors interface-extends cycle handling. class-branch in
// `resolveUserDefinedType` checks `visited.hadCycle` after the recursive superClass walk
// and returns null on pure-cycle failure (not `$Object('Object')`), letting the plugin
// emit generic `_at` instead of suppressing the polyfill
class A extends B {
  foo() {
    return this.at(0);
  }
}
class B extends A {}
declare const a: A;
_at(a).call(a, 0);