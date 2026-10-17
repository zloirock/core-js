export const viaRestSiblingBails = (({ flat, ...rest }) => [flat, rest])([1, [2]]);
