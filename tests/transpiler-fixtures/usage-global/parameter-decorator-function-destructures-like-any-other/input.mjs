// A parameter decorator's argument is walked apart from the main traversal, and a function inside it
// destructures as one anywhere else does: a declaration, an assignment, a default, a nested level, a nested
// function, an array wrapper declared and assigned, and a constructor rest each take the polyfill of the
// method or static they read, once.
const list = [1, 2];
export class Service {
  constructor(
    @Inject(() => { const { includes } = list; return includes; }) a: unknown,
    @Inject(() => { let trunc; ({ trunc } = Math); return trunc; }) b: unknown,
    @Inject(() => { const { of = null } = Array; return of; }) c: unknown,
    @Inject(() => { const { k: { flat } } = { k: [1, [2]] }; return flat; }) d: unknown,
    @Inject(() => function () { const { at } = list; return at; }) e: unknown,
    @Inject(() => { const [{ findLast }] = [[3, 4]]; return findLast; }) f: unknown,
    @Inject(() => { let last; [{ findLastIndex: last }] = [[5, 6]]; return last; }) g: unknown,
    @Inject(() => { const { groupBy, ...rest } = Map; return [groupBy, rest]; }) h: unknown,
  ) {}
}
