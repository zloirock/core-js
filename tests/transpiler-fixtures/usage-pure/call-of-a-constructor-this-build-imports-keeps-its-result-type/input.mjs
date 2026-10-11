// a call of a constructor this build imports in its place - the rewrite to the import lands before a
// later read of the call's result is typed - still yields that constructor's result: the description and
// the message read off it are strings. distinct member per line
const s = Symbol('x');
export const description = s.description.at(-1);
const e = AggregateError([], 'm');
export const message = e.message.includes('m');
