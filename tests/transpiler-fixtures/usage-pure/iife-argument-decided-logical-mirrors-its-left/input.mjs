// An IIFE argument whose `||` / `??` the build decides for its left is that left: the mirror replaces it.
export const viaOr = (({ from }) => from)(Array || Set);
export const viaNullish = (({ of }) => of)(Array ?? Set);
