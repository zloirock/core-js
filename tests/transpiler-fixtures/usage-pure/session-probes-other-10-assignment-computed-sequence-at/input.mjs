function eff() { return Object; }
{
o[(eff(), 'data')] = 'str'; const r2 = o[(eff(), 'data')].at(0);
}
