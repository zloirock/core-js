function eff() { return Object; }
{
o[(eff(), 'data')] = 'str'; const r2 = o.data.at(0);
}
