// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const P = Promise;
// core-js-disable-next-line
P.resolve = value => ({
  custom: value
});
r = Promise.resolve(1);