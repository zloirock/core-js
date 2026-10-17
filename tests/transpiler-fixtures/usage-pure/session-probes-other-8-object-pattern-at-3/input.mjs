const arr = [1, 2];
{
const { w: { at: m } } = { ...spread, w: arr }; use(m);
}
{
const { w: { at: m }, z } = { z: tick('z', 1), w: tick('w', arr) }; use(m, z);
}
