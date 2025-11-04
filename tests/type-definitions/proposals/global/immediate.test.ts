import 'core-js/full';
import '@core-js/types';

const res: number | object = setImmediate(() => 42);
clearImmediate(res);

// @ts-expect-error
setImmediate();
// @ts-expect-error
setImmediate(42);
// @ts-expect-error
clearImmediate();
// @ts-expect-error
clearImmediate('str');
