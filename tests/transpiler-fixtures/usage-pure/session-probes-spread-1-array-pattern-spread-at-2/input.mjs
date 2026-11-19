function eff() { return Object; }
{
const [x] = [...[[1, 2]], eff()]; x.at(0);
}
