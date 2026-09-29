import "core-js/modules/es.array.at";
// The sole dispatch owns the getter read inside its original control-flow position.
const wrap = {
  get box() {
    log("box");
    return {
      data: [1, 2]
    };
  }
};
let at;
({
  data: {
    at
  }
} = wrap.box);
log("done");