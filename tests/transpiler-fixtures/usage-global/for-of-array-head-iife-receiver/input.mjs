// an element a transparent IIFE returns is the host's own text: the literal it returns is descended
// and its slot mirrored in place - the call kept, with its body, its effects and the sibling slots as
// written. one static per row
for (const [{ entries: viaIife }] of [(() => [Object])()]) use(viaIife({}));
let ticks = 0;
for (const [{ values: viaIifeBody }] of [(() => {
  ticks++;
  return [Object];
})()]) use(viaIifeBody({}), ticks);
for (const [{ fromEntries: viaIifeSibling }, other] of [(() => [Object, 1])()]) use(viaIifeSibling([]), other);
for (const [{ hasOwn: viaIifeEffect }] of [(() => [Object, tick()])()]) use(viaIifeEffect({}, 'k'));
for (const [[{ assign: viaIifeDeep }]] of [(() => [[Object]])()]) use(viaIifeDeep({}, {}));
for (const { k: { is: viaIifeKeyed } } of [(() => ({ k: Object, z: tick() }))()]) use(viaIifeKeyed(1, 1));
