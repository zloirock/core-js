type A = Awaited<(Promise<number[]>)>;
declare const awaited: A;
awaited.at(0);
