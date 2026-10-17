const drr: number[] = [7];
(drr.at as any) = function () {
  return 2;
};