// Flow `declare class` parent with generic `extends Base<...>`: the super-type-args live on
// the heritage clause, so the inherited method return resolves through the subst to a
// concrete array type and narrows to the array variant.
declare class Base<U> { item(): U }
declare class Sub extends Base<number[]> {}
declare var s: Sub;
s.item().at(-1);
