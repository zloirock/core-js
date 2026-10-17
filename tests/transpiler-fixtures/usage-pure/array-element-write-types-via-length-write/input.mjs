// a `length` write truncates arbitrary indices - a member WRITE host bails
const trimmed = [[1], [2]];
trimmed.length = 1;
export const viaLengthWrite = trimmed[0].at(6);
