// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = { y: arr };
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;
function eff() { return Object; }
function eff2() {}
function mark(t, v) { log.push(t); return v; }

{
class K { f = (([{ from }]) => from)(...([[Array]] as any)); }
}
{
const [[{ from: f }]] = [([...[Array]] as any)];
}
{
const [{ at }] = ([[1, 2]] as any);
}
{
const [{ at }] = [([1, 2] as any)];
}
{
const [{ at }] = [...([[1, 2]] as any)];
}
{
const [{ at }] = [...([[1, 2]] as any)]; at(0);
}
{
const [{ at }] = [...[([1, 2] as any)]];
}
{
const [{ from: f }] = ([...[Array]] as any);
}
{
const [{ from: f }] = [(pick ? Array : userObj) as any];
}
{
const [{ from: f }] = [...([Array] as any)];
}
{
const [{ from: f }] = [...([pick ? Array : userObj] as any)];
}
{
const k = (tag: string) => (log.push(tag), tag)!; const { [k('at')!]: a } = arr;
}
{
const k = (tag: string) => (log.push(tag), tag); const { [(k as any)('at')]: a } = arr;
}
{
const k = (tag: string) => (log.push(tag), tag); const { [k('at' as string)]: a } = arr;
}
{
const k = (tag: string): string => (log.push(tag), tag); const { [k('at')]: a } = arr;
}
{
const k = <T,>(tag: T): T => (log.push(String(tag)), tag); const { [k<string>('at')]: a } = arr;
}
{
const r = (([{ at }]) => at)([[1]] as any);
}
{
const r = (([{ from: f }]) => f)(...([[pick ? Array : userObj]] as any));
}
{
const r = ((a: any) => a)(...([Array] as any)); const [{ of: o }] = [...([Array])];
}
{
const r = (({ at }) => at)(...([[1, 2]] as any));
}
{
const r = (({ from }) => from)(...([Array] as any));
}
{
const r = (({ from: f }) => f)(...([pick ? Array : userObj] as any));
}
{
const r = (({ w: [{ at }] }) => at)({ w: [[1] as number[]] });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)(({ w: [Object] } as any));
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: ([Object] as any) });
}
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [Object as any] });
}
{
const r = (0, (({ at }) => at))(([1, 2]) as any);
}
{
const r = o['data' as string].at(0);
}
{
const r4 = o[('s' as string)].at(0);
}
{
const v = Object.freeze(...([Array] as any)); v.from([]);
}
{
const v = Object.freeze(...([[1, 2]] as any)); v.at(0);
}
{
const v = Promise.resolve(...([Array] as any)); v.then(A => A.from([]));
}
{
const v = Promise.resolve(...([[1, 2]] as any)); v.then(a => a.at(0));
}
{
const { ['w' as string]: { at: a } } = { w: src };
}
{
const { [(eff('k'), 'w' as string)]: { at: a } } = { w: src };
}
{
const { [(eff('k'), 'w')]: { at: a } } = { w: src } as any;
}
{
const { a: { at } } = { a: ([1, 2] as any) };
}
{
const { at: m, z } = eff() as any; use(m, z);
}
{
const { w: { at: m }, z } = { w: [1, 2] as any, z: 1 }; use(m, z);
}
{
const { w: { at: m }, z } = { w: eff() as any, z: 1 } as any; use(m, z);
}
