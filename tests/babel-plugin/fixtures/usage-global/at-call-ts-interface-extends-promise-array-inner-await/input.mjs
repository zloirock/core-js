interface ArrayPromise extends Promise<string[]> {}
declare const p: ArrayPromise;
(await p).at(0).bold();
