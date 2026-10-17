import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
function ctorUnderRest() {
  const {
    w: {
      Map: restCtor
    },
    ...restDecl
  } = {
    w: {
      Map: _Map
    },
    z: 1
  };
  let restAssign;
  let restAssignRest;
  ({
    w: {
      Map: restAssign
    },
    ...restAssignRest
  } = {
    w: {
      Map: _Map
    },
    z: 2
  });
  const {
    w: {
      Array: {
        of: restStatic
      }
    },
    ...restStaticRest
  } = {
    w: {
      Array: {
        of: _Array$of
      }
    },
    z: 3
  };
  return [restCtor, restDecl, restAssign, restAssignRest, restStatic, restStaticRest];
}
export default [ctorUnderRest()];