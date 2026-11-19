// The computed key and default stay in the source in global mode. Injection serves
// the static and both possible receiver families of the later at call; rewriting
// pure's dead default must not suppress the modules this source needs.
let list = [1, 2];
const { [(effect(), 'from')]: from = (list = 'ab', 0) } = Array;
export const last = list.at(-1);
export { from };
