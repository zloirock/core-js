const arr = [1, 2];
function eff2() {}
{
const [{ at: m }] = [arr, eff2()]; use(m);
}
