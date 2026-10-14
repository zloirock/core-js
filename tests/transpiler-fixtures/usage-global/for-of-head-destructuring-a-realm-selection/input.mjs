// A for-of head destructuring a realm selection out of an array literal: the static and the instance leaf
// count as usage like their plain twins, the instance one generic, since the other arm is unknown.
for (const { Array: { prototype: { at }, of } } of [c ? globalThis : fb]) use(at, of);
