// a push through a binding an array pattern takes off a wrapper holding the array reaches that array: a
// pushed string widens the element a later read takes to every family, while the array itself, and an
// element no push reaches, stay typed
const rest = [];
{
const box = [1]; const [a] = [...rest, box]; a.push(2); box.at(0);
}
{
const box = [1]; const [a] = [box]; a.push(2); box.at(0);
}
{
const box = [[1]]; box[0].at(0);
}
{
const box = [[1]]; const [a] = [...rest, box]; a.push('s'); box[0].at(0);
}
{
const box = [[1]]; const [a] = [box]; a.push('s'); box[0].at(0);
}
