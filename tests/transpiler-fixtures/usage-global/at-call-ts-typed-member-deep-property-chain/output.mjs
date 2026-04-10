import "core-js/modules/es.array.at";
type A = {
  b: {
    c: {
      d: {
        e: string[];
      };
    };
  };
};
declare const a: A;
a.b.c.d.e.at(-1);