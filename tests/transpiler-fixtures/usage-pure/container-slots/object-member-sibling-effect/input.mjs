// A direct static member read preserves effects in another property of its container.
let memberEffects = 0;
function memberBump() { memberEffects += 1; return 0; }
const memberSiblingEffectSurvives = (function () {
  const effectHolder = { x: memberBump(), k: Object };
  return effectHolder.k.getOwnPropertySymbols({ a: 1 });
})();
export { memberEffects, memberSiblingEffectSurvives };
