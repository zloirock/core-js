import _Object$seal from "@core-js/pure/actual/object/seal";
// A switch discriminant compares the container without replacing its constructor slot.
const switchDiscriminantLeaksNothing = function () {
  const switchBox = {
    k: Object
  };
  switch (switchBox) {
    default:
      break;
  }
  const {
    k: {
      seal: viaSwitch
    }
  } = {
    k: {
      seal: _Object$seal
    }
  };
  return viaSwitch;
}();
export { switchDiscriminantLeaksNothing };