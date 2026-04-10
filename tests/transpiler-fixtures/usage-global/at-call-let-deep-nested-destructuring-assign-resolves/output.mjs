import "core-js/modules/es.string.at";
let c;
({
  a: {
    b: {
      c
    }
  }
} = {
  a: {
    b: {
      c: 'deep'
    }
  }
});
c.at(-1);