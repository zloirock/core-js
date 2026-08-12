// an ambient overload set with a REST arm: the rest arm accepts any arity, so it is never
// refuted, but the DISCRETE arm still is - a two-arg call leaves the rest arm alone and narrows,
// while a one-arg call both arms could take stays on the generic helper. the estree lane binds
// ambient names to ONE head and must re-route through the by-name set instead of that head
declare function ra(...xs: string[]): number[];
declare function ra(x: number): string;
export const viaRestCall = ra('a', 'b').at(0);
export const viaDiscreteCall = ra(5).includes(1);

// a SINGLE-head ambient still narrows precisely through the same by-name route
declare function solo(x: number): number[];
export const viaSingleHead = solo(1).at(1);
