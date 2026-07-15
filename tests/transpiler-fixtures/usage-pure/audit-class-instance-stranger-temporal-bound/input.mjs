// the temporal bound is the last point an instance can still observe the field: writes past it are
// dead and must not widen. the bound is raised from `new C().m()` chain calls looked up by the
// constructor's NAME, so a same-named class calling LATER would stretch it over a dead write. the
// `at` row carries that stranger; the `includes` row is the same shape with the name changed
class Holder {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
const h = new Holder();
h.getFirst();
h.items = "string";
const k = new Keeper();
k.hasFirst();
k.entries = "string";

// a stranger of the SAME name calls after the dead write - the bound must not follow it
function strangerCallsLater() {
  class Holder {
    ping() {
      return 1;
    }
  }
  new Holder().ping();
}

// the control: same shape, no name collision
function unrelatedCallsLater() {
  class Elsewhere {
    ping() {
      return 1;
    }
  }
  new Elsewhere().ping();
}

strangerCallsLater();
unrelatedCallsLater();
