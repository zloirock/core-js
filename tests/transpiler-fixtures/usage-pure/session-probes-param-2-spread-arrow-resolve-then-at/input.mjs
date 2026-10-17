{
const v = Promise.resolve(...[[1, 2]]); v.then(a => a.at(0));
}
