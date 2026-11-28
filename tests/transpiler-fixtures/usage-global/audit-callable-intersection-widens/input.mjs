// An intersection of competing call results remains wide.
declare const arrayFirst: (() => string[]) & (() => string);
export const a = arrayFirst().at(0);
