// proposal stage: 1
// https://github.com/tc39/proposal-await-dictionary

type Dict<V> = { [k: string | symbol]: V };

interface PromiseConstructor {
  allKeyed<D extends Dict<Promise<any>>>(promises: D): Promise <{ [k in keyof D]: Awaited<D[k]> }>
}
