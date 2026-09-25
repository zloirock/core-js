import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a MEMBER read through the container a call yields, the twin of the destructure form: a slot the
// callee fills from a parameter reads the argument THIS call passes, any other slot the callee's
// literal - through the call itself, a binding of it, a nested slot and a captured intermediate
// container alike. the Map call's value owes its constructor entry; no row takes its `groupBy`
const build = value => ({
  a: Math,
  b: value,
  n: {
    c: Object,
    d: value
  }
});
export const inlineLiteral = build(Array).a.trunc(1.5);
export const inlineParam = build(Object).b.groupBy([1], v => v);
const held = build(String);
export const boundLiteral = held.a.sign(-1);
export const boundParam = held.b.raw`x`;
export const nestedLiteral = build(Math).n.c.entries({});
export const nestedParam = build(Math).n.d.cbrt(8);
const inner = build(Array).n;
export const capturedParam = inner.d.of(1);
export const capturedLiteral = inner.c.values({});
const other = build(Map);