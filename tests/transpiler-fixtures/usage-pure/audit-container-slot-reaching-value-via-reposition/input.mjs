// a repositioned array container bails every slot read via the wildcard
const rd = [{ n: 1 }, Object];
rd.reverse();
const { 0: { values: viaReposition } } = rd;
export { viaReposition };
