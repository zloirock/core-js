// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
// core-js-disable-next-line
Object.defineProperty(Promise, "resolve", { value: value => ({ custom: value }), configurable: true });
r = Promise.resolve(1);
