import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
let ccG = 0;
const dheG = () => {
  ccG++;
  return globalThis;
};
export const viaSeCallClaimG = (dheG().window?.self).Array.of(5).at(0);
export { ccG };