import setImmediate from '@core-js/pure/full/set-immediate';
import clearImmediate from '@core-js/pure/full/clear-immediate';

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
