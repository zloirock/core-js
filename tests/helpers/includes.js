global.includes = function (target, element) {
  for (var i = 0, length = target.length; i < length; ++i) if (target[i] === element) return true;
  return false;
};
