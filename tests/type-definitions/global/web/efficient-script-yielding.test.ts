import 'core-js/full';

const res: number | object = setImmediate(() => 42);
clearImmediate(res);

// @ts-expect-error
setImmediate();
// @ts-expect-error
setImmediate(42);
// @ts-expect-error
clearImmediate('str');
