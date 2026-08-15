// an identity static returns its argument, so an unresolvable argument makes the call
// unresolvable too - the registry's generic Object hint would suppress the instance polyfill
// outright, which is a missed polyfill on the target rather than a lost narrow
declare const opaque: any;
Object.freeze(opaque).at(0);
Object.freeze([1, 2]).includes(1);
