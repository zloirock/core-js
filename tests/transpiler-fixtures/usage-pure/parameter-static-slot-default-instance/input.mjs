// A nested slot default keeps the static receiver, including the method used by its instance read.
function read({ from: { name } = {} } = Array) { return name; }
read();
