// A conditional static branch stays beside its native neighbour under one array capture.
// The condition runs before either getter, including after destructuring lowering.
const [{ native }, { from }] = [source, (effect(), pick) ? Array : other];
let beside, of;
([{ beside }, { of }] = [second, (effect(), choose) ? Array : custom]);
use(native, from, beside, of);
