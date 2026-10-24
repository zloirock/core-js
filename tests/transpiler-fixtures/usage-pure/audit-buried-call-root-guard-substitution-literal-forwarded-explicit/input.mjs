const forwardsExplicit = () => ({ window: { Array: Array } });
export const literalForwardedExplicit = forwardsExplicit()?.window?.Array.of(14);
