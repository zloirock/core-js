function eff() { return Object; }
{
const [{ at }] = [...[[1, 2]], eff()];
}
