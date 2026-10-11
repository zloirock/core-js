// an exported pattern whose instance read sits under an effectful computed key exports only its source
// bindings - alone, ahead of a later declarator or after an earlier one - and the receiver it captures
// stays private
let k17 = 0;
export var { [(k17++, 'toSorted')]: _u17, other17 } = holder17.p;
export const r17 = [typeof _u17, typeof other17, k17];
let k18 = 0;
export var { [(k18++, 'values')]: _u18, other18 } = holder18.p, z18 = 1;
export const r18 = [typeof _u18, typeof other18, z18, k18];
let k19 = 0;
export var z19 = 1, { [(k19++, 'keys')]: _u19, other19 } = holder19.p;
export const r19 = [z19, typeof other19, k19];
