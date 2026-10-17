const k = 'k';
{
const k = 'w'; let m; ({ [k]: { at: m } } = { w: [1, 2] }); use(m);
}
