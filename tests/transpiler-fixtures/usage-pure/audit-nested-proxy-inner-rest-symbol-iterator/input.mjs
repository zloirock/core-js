// inner-level rest beside a consumed [Symbol.iterator] key under a proxy-global hop. the kept rest
// sentinel must re-key through the polyfilled Symbol.iterator binding (`[_Symbol$iterator]: _unused`)
// so engines without native Symbol can still evaluate the computed key in the residual pattern - a
// native `[Symbol.iterator]` would be a ReferenceError on ie:11. the OUTER-level sentinel already
// translates this; the inner-level rebuilt-prop sentinel must do the same
const { self: { [Symbol.iterator]: it, ...rest } } = globalThis;
it;
export { it, rest };
