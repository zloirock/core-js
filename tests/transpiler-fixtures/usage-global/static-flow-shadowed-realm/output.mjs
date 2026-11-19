// User receivers retain their own values.
let r;
const effects = [];
const globalThis = {
  window: {
    self: {
      Map: {
        groupBy: {
          length: 23
        }
      }
    }
  }
};
const {
  groupBy: {
    length
  }
} = (globalThis.window?.self).Map;
r = length;