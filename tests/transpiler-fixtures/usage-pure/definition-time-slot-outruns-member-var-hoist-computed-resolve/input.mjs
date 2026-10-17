const o = {
  [Promise.resolve(3)]() {
    var Promise = 3;
    return Promise;
  },
};
export { o };
