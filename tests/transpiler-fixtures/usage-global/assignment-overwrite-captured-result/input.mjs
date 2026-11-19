// A captured assignment result cannot be replaced by its extracted method.
let method;
const captured = ({ [(effect(), Symbol.iterator)]: method = fallback() } = globalThis);
