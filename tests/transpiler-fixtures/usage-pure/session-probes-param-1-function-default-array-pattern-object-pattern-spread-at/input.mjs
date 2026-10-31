const arr = [1, 2];
const nb = { y: arr };
{
const nb = { y: [1] }; function g([{ y: { at: a } }] = [...[nb]]) { return a; }
}
