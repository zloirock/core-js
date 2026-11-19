// the control: same shape, no name collision
function unrelatedCallsLater() {
  class Elsewhere {
    ping() {
      return 1;
    }
  }
  new Elsewhere().ping();
}
unrelatedCallsLater();
