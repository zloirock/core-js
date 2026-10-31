import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
let localAssigned;
[localAssigned] = [{
  tags: 'yz',
  scan() {
    var _ref;
    return _includesMaybeString(_ref = this.tags).call(_ref, 'y');
  }
}];
localAssigned.scan();