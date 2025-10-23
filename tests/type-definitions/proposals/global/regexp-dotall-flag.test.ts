import 'core-js/full';

const r1 = new RegExp('foo.bar', 's');
const dotAll: boolean = r1.dotAll;

// @ts-expect-error
r1.dotAll();
// @ts-expect-error
r1['dotAll'] = false;
// @ts-expect-error
RegExp.prototype['dotAll'] = true;
// @ts-expect-error
RegExp.prototype.dotAll();
// @ts-expect-error
const err: string = r1.dotAll;
