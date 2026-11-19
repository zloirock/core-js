// An optional read through a known object slot reaches the constructor held there.
const memberOptionalHop = (function () {
  const optionalHolder = { k: Object };
  return optionalHolder.k?.entries({ b: 2 });
})();
export { memberOptionalHop };
