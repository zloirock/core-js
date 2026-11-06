// a maybe-undefined arg is not a usable receiver - the default stays the union source
export const viaMaybeArg = (({ groupBy } = Map) => groupBy)(maybe);
