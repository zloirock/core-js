module.exports = function read(u: number[]) {
  ++(u as any);
  arguments[0] = 'ab';
  return u.at(-1);
};
