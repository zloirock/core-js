// a param SHADOWING the arg's name must not swallow the receiver (param-default arm)
export const viaShadowDefault = !function ({ of } = WeakMap, Array) { return of; } (Array);
