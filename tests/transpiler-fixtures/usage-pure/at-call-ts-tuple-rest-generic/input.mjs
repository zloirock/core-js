type WithRest<T> = [string, ...T[][]];
function run(t: WithRest<number>) {
  t[5].at(0);
}
