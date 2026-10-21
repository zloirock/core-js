// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
const make = () => (log.push('make'), [Math]);
const [{ trunc: viaPrefixed } = {}] = (log.push('prefix'), make());
const [{ sign: viaOptional } = {}] = make?.();
const [{ cbrt: viaLiteral } = {}] = (log.push('literal'), [Math]);
export { viaPrefixed, viaOptional, viaLiteral, log };
