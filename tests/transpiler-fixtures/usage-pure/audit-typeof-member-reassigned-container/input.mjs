// `typeof container.field` may read the initialiser only while nothing reassigns the container -
// otherwise the first init no longer describes the runtime value.
let container = { field: [1, 2, 3] };
container = { field: "text" } as any;
const frozen = { slot: [1, 2, 3] };
declare const reassigned: typeof container.field;
declare const kept: typeof frozen.slot;
reassigned.at(0);
kept.includes(1);
