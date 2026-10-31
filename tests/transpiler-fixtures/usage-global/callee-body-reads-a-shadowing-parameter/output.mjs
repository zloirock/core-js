// A parameter may SHADOW a proxy global, and a body reading it reads the PARAMETER. The fold that
// resolves a call to its callee's body anchors that body in the scope the callee was DECLARED in,
// where the parameter name is unbound - so a body reading a parameter is no proof of what the call
// yields, and the read stays where the source wrote it. Each row spells another proxy name.
const fake = {
  Array: {
    from: fallback
  },
  Map: {
    groupBy: fallback
  },
  Promise: {
    resolve: fallback
  }
};
const viaArrow = globalThis => globalThis.Array;
const viaExpression = function (window) {
  return window.Map;
};
export const arrowRead = viaArrow(fake).from([1]);
export const expressionRead = viaExpression(fake).groupBy([2], x => x);
export const iifeRead = (self => self.Promise)(fake).resolve(3);