// iteration hands elements out like a spread does - it bails
const looped = [[1], [2]];
export const viaForOfEscape = looped[0].at(9);
