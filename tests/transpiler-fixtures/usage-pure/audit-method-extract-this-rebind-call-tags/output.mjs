import _includes from "@core-js/pure/actual/instance/includes";
const plucked = {
  tags: 'ab',
  scan() {
    var _ref;
    return _includes(_ref = this.tags).call(_ref, 'a');
  }
};
const {
  scan
} = plucked;
scan.call({
  tags: ['q']
});