module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError((name ? name + ': i' : 'I') + 'ncorrect invocation!');
  } return it;
};
