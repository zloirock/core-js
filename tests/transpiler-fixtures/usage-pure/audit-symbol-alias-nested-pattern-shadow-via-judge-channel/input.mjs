const { iterator } = Symbol;
const { iterator: SymVal } = globalThis.Symbol;
function judgeChannelHost() {
  const { iterator } = SymVal;
  return [1][iterator];
}
export const viaJudgeChannel = judgeChannelHost();
