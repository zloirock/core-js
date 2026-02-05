import 'core-js/stable';
import $setImmediate from 'core-js/stable/set-immediate';
import $clearImmediate from 'core-js/stable/clear-immediate';

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
