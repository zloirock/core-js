let effCount = 0;
const eff9 = () => effCount++;
let rw9 = { d: Object };
rw9 = (eff9(), { d: Promise });
const { d: { allSettled: viaSeWrite } } = rw9;
export { viaSeWrite };
