// An arrow's expression body stays an expression when the memo its rewrite declared is dropped:
// babel braced the body to host the `var`, and that block is no text the source wrote. A body the
// user wrote as a block stays one.
const mk = () => globalThis;
let g;
export const viaDecided = () => ({ groupBy: g } = Map || Set);
export const viaEffect = () => ({ groupBy: g } = (log.push('p'), Map || Set));
export const viaCallNav = () => ({ groupBy: g } = mk().Map);
export const asWritten = () => {
  return ({ groupBy: g } = Map || Set);
};
