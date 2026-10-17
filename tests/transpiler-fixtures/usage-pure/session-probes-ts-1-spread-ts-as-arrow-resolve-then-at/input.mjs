{
const v = Promise.resolve(...([[1, 2]] as any)); v.then(a => a.at(0));
}
