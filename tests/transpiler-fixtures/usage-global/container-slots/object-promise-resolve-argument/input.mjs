// Promise.resolve receives the container before its nested constructor slot is read.
const escapedThroughPromiseResolve = (function () {
  const awaitedBox = { k: Object };
  void Promise.resolve(awaitedBox);
  const { k: { entries } } = awaitedBox;
  return entries;
})();
export { escapedThroughPromiseResolve };
