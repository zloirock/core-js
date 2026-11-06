// a mutating method retypes elements the same way an element write does - which methods
// mutate is registry data, not local knowledge
const pushed = [[1], [2]];
pushed.push([3]);
export const viaMutatorCall = pushed[0].at(0);
