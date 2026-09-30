// A switch discriminant compares the container without replacing its constructor slot.
const switchDiscriminantLeaksNothing = (function () {
  const switchBox = { k: Object };
  switch (switchBox) { default: break; }
  const { k: { seal: viaSwitch } } = switchBox;
  return viaSwitch;
})();
export { switchDiscriminantLeaksNothing };
