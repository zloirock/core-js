// a qualified type name rooted at a proxy-global (globalThis / self) names the real global TYPE,
// so its polyfill is pulled in for the member - and for each link along a proxy chain
let setRef: globalThis.Set<number>;
let weakRef: self.WeakMap<object, number>;
let mapRef: globalThis.self.Map<string, number>;
export { setRef, weakRef, mapRef };
