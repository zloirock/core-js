// A local callee receives the container and writes its constructor slot before the nested read.
function poisonContainer(target) { target.k = Map; }
const closureWrite = (function () {
  const closed = { k: Object };
  poisonContainer(closed);
  const { k: { entries } } = closed;
  return entries;
})();
export { closureWrite };
