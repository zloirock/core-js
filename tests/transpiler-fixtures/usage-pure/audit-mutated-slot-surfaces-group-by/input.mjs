// a BARE reassignment of a global name writes the same slot as `globalThis.Map = ...`:
// later reads (static AND prototype) route the live slot
Map = shimB;
use(Map.groupBy(y, k));
