// The computed key and the property getter run in source order inside an unbraced body.
const effects = [];
const source = { get at() { effects.push('get'); return () => 7; } };
if (source) var { [(effects.push('key'), 'at')]: at } = source;
export const result = [at(), effects];
