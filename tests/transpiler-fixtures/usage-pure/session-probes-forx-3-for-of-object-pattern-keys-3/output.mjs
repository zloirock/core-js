// Plain and getter-backed loop elements retain their native keys reads and distinct evaluation paths.
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: Object
  }, {
    get w() {
      return Object;
    }
  }]) keys;
}