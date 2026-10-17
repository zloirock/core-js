const boundCallee = () => (globalThis.cond ? Promise : Map);
export const viaBoundCallee = boundCallee().race;
