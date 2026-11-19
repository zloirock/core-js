const log = [];
{
function f({ from } = ((x) => (log.push('x'), x))(Array)) { return from; }
}
