// Map.counter++ — the member is UpdateExpression target. Should NOT mark as usage
// of Map.counter (read-only polyfill semantics), but the Map constructor itself is
// still a live reference — need its constructor polyfill.
Map.counter++;
