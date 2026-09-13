import { before, make, key, after, last, unknownKey } from './export-retained-input.js';

// The computed read stays between the leading initializer and the retained sibling.
// eslint-disable-next-line @stylistic/one-var-declaration-per-line -- one exported declaration owns every source slot
export const lead = before(), { [(key(), 'at')]: at, custom } = make(), mid = after(), { from } = Array, tail = last();

// eslint-disable-next-line unicorn/no-unused-properties -- the unknown key is a possible override
const clean = { Q: Array, [unknownKey(false)]: Map };
// eslint-disable-next-line unicorn/no-unused-properties -- the unknown key overrides Q at runtime
const replaced = { Q: Array, [unknownKey(true)]: Map };
export const { Q: { of: method } } = clean;
export const { Q: { of: overridden } } = replaced;
