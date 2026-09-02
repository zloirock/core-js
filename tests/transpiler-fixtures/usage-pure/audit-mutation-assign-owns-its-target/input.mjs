// `Object.assign` is the one call whose writes this census can NAME, so handing it a container is
// not the blanket escape every other call is: the keys it installs are recorded one by one and
// every OTHER slot of that container stays readable. ownership needs every source readable - an
// opaque source or a key the walk cannot fold puts the target back under the generic wildcard
const owned = { a: Object, b: Map };
Object.assign(owned, { a: 1 });
owned.b.groupBy(src, it => it);

const opaqueSource = { a: Object, b: Set };
Object.assign(opaqueSource, src);
opaqueSource.b.union(other);

const opaqueKey = { a: Object, b: WeakMap };
Object.assign(opaqueKey, { [k]: 1 });
opaqueKey.b.of(src);
