// an INTERMEDIATE hop through a union must fold its branches, not take the first that
// resolves: a value matching a later branch would dispatch through the first branch's
// type-specific helper and throw. convergent branches keep the narrow
type ArrayHop = { item: { value: string[]; }; };
type StringHop = { item: { value: string; }; };
declare const divergent: ArrayHop | StringHop;
export const degraded = divergent.item.value.at(0);
type NumberHop = { item: { value: number[]; }; };
declare const convergent: ArrayHop | NumberHop;
export const narrowed = convergent.item.value.at(0);
declare const single: ArrayHop;
export const singleBranch = single.item.value.at(0);
// the same fold applies when the hop is a CALL RETURN rather than a member. a structural return
// resolves to no runtime type, so the branches fold to nothing - which is NOT divergence, and
// identical returns must keep their narrow
type ArrayMaker = { make(): { rows: number[]; }; };
type OtherArrayMaker = { make(): { rows: string[]; }; };
declare const makers: ArrayMaker | OtherArrayMaker;
export const viaCall = makers.make().rows.includes(1);
// diverging FAMILIES behind the same call still degrade
type StringMaker = { make(): { rows: string; }; };
declare const mixed: ArrayMaker | StringMaker;
export const viaCallDegraded = mixed.make().rows.at(0);
