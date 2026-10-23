# `Object.fromEntries`
[Specification](https://tc39.es/proposal-object-from-entries/)\
[Proposal repo](https://github.com/tc39/proposal-object-from-entries)

## Modules
[`es.object.from-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.from-entries.js).

## Built-ins signatures
```ts
class Object {
  static fromEntries(iterable: Iterable<[key, value]>): Object;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/object-from-entries
core-js(-pure)/es|stable|actual|full/object/from-entries
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/object-from-entries`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/object-from-entries.d.ts)

## Examples
```js
const map = new Map([['a', 1], ['b', 2]]);
Object.fromEntries(map); // => { a: 1, b: 2 }

class Unit {
  constructor(id) {
    this.id = id;
  }
  toString() {
    return `unit${ this.id }`;
  }
}

const units = new Set([new Unit(101), new Unit(102)]);

Object.fromEntries(units.entries()); // => { unit101: Unit { id: 101 }, unit102: Unit { id: 102 } }
```
