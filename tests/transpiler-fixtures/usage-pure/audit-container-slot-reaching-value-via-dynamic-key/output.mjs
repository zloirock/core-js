import _Promise from "@core-js/pure/actual/promise";
// the const-bound key names the same slot; pure keeps its written value native
const cd = {
  d: Object
};
const dyn = 'd';
cd[dyn] = _Promise;
const {
  d: {
    withResolvers: viaDynamicKey
  }
} = cd;
export { viaDynamicKey };