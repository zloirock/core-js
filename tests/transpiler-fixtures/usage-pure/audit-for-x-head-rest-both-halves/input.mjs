// a REST beside a claim is what the relocation buys room for: the head takes a minted name and the
// pattern moves to the body, where the read renders and the rest stays behind it - reading the same
// minted receiver with the consumed key renamed to a sentinel, so it gathers exactly what the source
// left it. the STATIC half reaches its receiver through the identity guard, the INSTANCE half
// through the dispatcher; both keep the residual
const seen = [];
for (var { from, ...staticRest } of [Array]) seen.push(typeof from, 'from' in staticRest);

for (var { at, ...instanceRest } of [[1, 2]]) seen.push(typeof at, 'at' in instanceRest);
export { seen };
