const rsmd1: symbol = Symbol.metadata;
const rsmd2: typeof Symbol.metadata = Symbol.metadata;

type T = {
  [Symbol.metadata]?: object;
};

const obj: T = {};
obj[Symbol.metadata] = { foo: 1 };

const maybeMeta: object | undefined = obj[Symbol.metadata];

// @ts-expect-error
Symbol['metadata'] = Symbol('other');
// @ts-expect-error
obj[Symbol.metadata] = 123;
