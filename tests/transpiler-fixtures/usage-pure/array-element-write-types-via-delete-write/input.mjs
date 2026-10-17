// a delete is an element write host
const gapped = [[1], [2]];
delete gapped[0];
export const viaDeleteWrite = gapped[0].includes(2);
