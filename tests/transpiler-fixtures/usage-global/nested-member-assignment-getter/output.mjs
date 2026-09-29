import "core-js/modules/es.array.at";
// A sole nested assignment evaluates the member root once and retains each getter in order.
const wrap = {
  get box() {
    log('box');
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