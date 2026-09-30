import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// Reflect.apply passes the array receiver to a detached repositioning method.
const repositionedByReflectApply = function () {
  const reflected = [Object];
  _Reflect$apply(reflected.reverse, reflected, []);
  const {
    0: {
      getOwnPropertyNames
    }
  } = reflected;
  return getOwnPropertyNames;
}();
export { repositionedByReflectApply };