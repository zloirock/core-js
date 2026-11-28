declare const stringFirst: (() => string) & (() => string[]);
export const b = stringFirst().at(0);
