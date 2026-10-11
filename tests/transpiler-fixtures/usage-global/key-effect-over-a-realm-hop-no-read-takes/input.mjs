// a computed key consuming the whole declaration over a realm hop no read takes owes the hop only what
// discarding it runs - the effect in its object or in its key, its own claims rendered - ahead of the key,
// and the constructor the hop names leaves with its import
// usage-global rewrites nothing: the realm reads load `globalThis`, the `Map` and `Iterator` reads their
// constructor families, `groupBy`, `from` and `log.push` their own modules
export const log = [];
export const { [(log.push('k1'), 'groupBy')]: groupBy } = (log.push('i1'), globalThis).Map;
export const { [(log.push('k2'), 'from')]: from } = globalThis[(log.push('i2'), 'Iterator')];
