// A folded proxy key keeps its effect while constructor rest requires the full family.
export function read({ all, ...rest } = globalThis[(hit(), "self")].Promise) {
  return [all, rest];
}
