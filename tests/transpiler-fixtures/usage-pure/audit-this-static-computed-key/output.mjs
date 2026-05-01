import _Array$from from "@core-js/pure/actual/array/from";
// `this[KEY](...)` in a static method via computed-key with a const-bound name. provider's
// resolveKey unwraps the alias chain (`KEY` -> 'from') and routes through resolveStaticInheritedMember,
// which retargets to `Array.from` since Child extends Array. polyfill emit confirms the
// const-alias key resolution wires into the static-inherited dispatch end-to-end
class Child extends Array<number> {
  static probe(xs: Iterable<number>) {
    const KEY = 'from';
    return _Array$from(xs);
  }
}
Child.probe([1, 2, 3]);