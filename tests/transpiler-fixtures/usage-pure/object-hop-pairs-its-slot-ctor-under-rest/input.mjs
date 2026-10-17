function ctorUnderRest() {
  const { w: { Map: restCtor }, ...restDecl } = { w: globalThis, z: 1 };
  let restAssign;
  let restAssignRest;
  ({ w: { Map: restAssign }, ...restAssignRest } = { w: globalThis, z: 2 });
  const { w: { Array: { of: restStatic } }, ...restStaticRest } = { w: globalThis, z: 3 };
  return [restCtor, restDecl, restAssign, restAssignRest, restStatic, restStaticRest];
}
export default [ctorUnderRest()];
