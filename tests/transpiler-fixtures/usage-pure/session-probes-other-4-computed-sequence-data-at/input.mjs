function eff() { return Object; }
{
const o = { data: [1] }; const r = o[(eff(), 'data')].at(0);
}
