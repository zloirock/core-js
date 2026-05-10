// three Awaited layers around three Promise layers; final inner type drives narrowing
type T = Awaited<Awaited<Awaited<Promise<Promise<Promise<string[]>>>>>>;
declare const x: T;
x.includes('a');
x.at(0);
x.flat();
