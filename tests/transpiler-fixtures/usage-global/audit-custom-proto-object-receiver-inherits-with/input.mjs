let shadowedGlobal = {};
{
  const Object = myLib;
  Object.setPrototypeOf(shadowedGlobal, Array.prototype);
}
export const k = shadowedGlobal.with(0, 1);
