import "core-js/modules/es.array.find-last";
let viaCall = {};
Object.setPrototypeOf(viaCall, Array.prototype);
export const c = viaCall.findLast(f);