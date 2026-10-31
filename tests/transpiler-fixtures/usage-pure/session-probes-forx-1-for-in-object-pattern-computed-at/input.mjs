const k = 'k';
const obj = {};
{
const k = 'w'; for (const { [k]: { at: m } } in obj) use(m);
}
