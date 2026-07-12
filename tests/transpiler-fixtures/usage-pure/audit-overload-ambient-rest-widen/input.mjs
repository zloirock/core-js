// an ambient overload set with a REST arm is not arity-matchable - the fold WIDENS to the
// generic helper on BOTH the rest-taking and the discrete-arm call, on both emitters (the
// estree lane binds ambient names to ONE head and must re-route through the by-name set
// instead of single-selecting that head's return)
declare function ra(...xs: string[]): number[];
declare function ra(x: number): string;
export const viaRestCall = ra('a', 'b').at(0);
export const viaDiscreteCall = ra(5).includes(1);

// a SINGLE-head ambient still narrows precisely through the same by-name route
declare function solo(x: number): number[];
export const viaSingleHead = solo(1).at(1);
