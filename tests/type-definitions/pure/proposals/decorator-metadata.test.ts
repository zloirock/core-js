import metadata from '@core-js/pure/full/symbol/metadata';

const rsmd1: symbol = metadata;
const rsmd2: typeof metadata = metadata;

interface T {
  [metadata]?: object;
}

const obj: T = {};
obj[metadata] = { foo: 1 };

const maybeMeta: object | undefined = obj[metadata];

// @ts-expect-error
obj[metadata] = 123;
