// A user-imported URL namespace keeps its acronym when naming the superclass.
// It already carries canParse, so the inherited read needs no additional static import.
// The constructor-entry reverse mapping is also asserted directly in the resolver suite.
import MyURL from '@core-js/pure/actual/url';
class CanonicalChecker extends MyURL {
  static probe(input) {
    return super.canParse(input);
  }
}