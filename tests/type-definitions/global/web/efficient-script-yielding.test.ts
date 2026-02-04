import 'core-js/full';
import $setImmediate from 'core-js/full/set-immediate';
import $clearImmediate from 'core-js/full/clear-immediate';

const resNS: number | object = $setImmediate(() => 42);
$clearImmediate(resNS);

const res: number | object = setImmediate(() => 42);
clearImmediate(res);

// @ts-expect-error
$setImmediate();
// @ts-expect-error
$clearImmediate('str');

// @ts-expect-error
setImmediate();
// @ts-expect-error
setImmediate(42);
// @ts-expect-error
clearImmediate('str');
