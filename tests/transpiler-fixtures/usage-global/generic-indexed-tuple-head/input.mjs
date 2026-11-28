declare const tup: [string, number];
function head<T extends unknown[]>(t: T): T[0] { return t[0]; }
head(tup).includes('q');
