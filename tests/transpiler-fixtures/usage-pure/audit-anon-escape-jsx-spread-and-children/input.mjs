// the JSX attribute channel is not the only one that hands an object to the component: a spread
// attribute copies the object's own enumerable props into the props object, a child expression
// container becomes `props.children`, and a spread child spreads into the children list. all three
// end up retained by the component exactly like the attribute value, so the field narrow has to
// stand down in each - a kept narrow would emit an array-specific helper for a field an outside
// holder can flip. `at` and `includes` are the two methods carrying both an array and a string
// variant, so the type-agnostic entry is visible as a different helper
export const viaSpreadAttr = <Widget {...{
  items: [1, 2],
  read() {
    return this.items.at(0);
  }
}} />;
export const viaChild = <Widget>{{
  items: [1, 2],
  read() {
    return this.items.includes(1);
  }
}}</Widget>;
export const viaSpreadChild = <Widget>{...{
  items: [1, 2],
  read() {
    return this.items.at(0);
  }
}}</Widget>;
