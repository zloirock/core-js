// a dynamic-key write may land on ANY slot, so its value reaches every slot read
const cd = { d: Object };
const dyn = 'd';
cd[dyn] = Promise;
const { d: { withResolvers: viaDynamicKey } } = cd;
export { viaDynamicKey };
