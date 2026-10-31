import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// an INNER assignment below a hop of the outer stored value: the innermost unread target
// collapses (`k4 = _self`), the outer inherits the kept read off it - claiming the OUTER span
// with a root-substituted-raw spelling would subsume the inner claim instead
let k3, k4, k5, k6;
export const storedNestedLeaf = (k3 = (k4 = globalThis.self).window)?.Object.getPrototypeOf({});