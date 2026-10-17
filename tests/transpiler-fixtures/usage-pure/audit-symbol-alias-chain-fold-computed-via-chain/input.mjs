// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = globalThis.self.Symbol;
const { iterator: viaChain } = ChainSymbol;
export const b = [3, 4][viaChain];
