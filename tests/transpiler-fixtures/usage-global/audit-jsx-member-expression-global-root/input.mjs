// `<Map.Provider />` - JSXMemberExpression as tag-name. the root identifier `Map` is the
// runtime reference (the `.Provider` chain accesses a property on the global), so plugin
// polyfills it via side-effect import. without root detection the polyfill would be missed
const elem = <Map.Provider value={x}>{children}</Map.Provider>;
export { elem };
