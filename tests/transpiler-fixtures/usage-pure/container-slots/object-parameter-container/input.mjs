// A nested read uses the object supplied to the container parameter.
const parameterContainer = (function (incoming) {
  const { k: { values } } = incoming;
  return values;
})({ k: Object });
export { parameterContainer };
