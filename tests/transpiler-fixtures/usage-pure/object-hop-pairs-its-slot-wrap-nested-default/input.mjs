const [{ Map: wrapNestedDefault }] = [(globalThis ?? {}) ?? {}];
export default [wrapNestedDefault];
