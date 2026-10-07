// A capitalised user global on the left of `||` / `??` reads a key naming an instance method through the
// generic dispatch, unless the right's constructor owns the key as a static: that arm then takes the
// static's own entry, as the conditional spelling does. A key the right owns no static of keeps the dispatch.
const { concat } = Stub || Iterator;
const { values } = Stub ?? Object;
const { includes } = Stub ?? Object;
export { concat, values, includes };
