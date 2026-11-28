// Run the shifted grid through the same isolated raw runner as the original exercise.
import { mock } from 'node:test';
import GridModel from 'echarts/lib/coord/cartesian/GridModel.js';
import { run as runEcharts } from './exercises/echarts.mjs';

export function run() {
  const { getBoxLayoutParams } = GridModel.prototype;
  const shiftGrid = mock.method(GridModel.prototype, 'getBoxLayoutParams', function () {
    const { left, right, ...rest } = getBoxLayoutParams.call(this);
    return { ...rest, left: left - 600, right: right + 600 };
  });
  try {
    return runEcharts();
  } finally {
    shiftGrid.mock.restore();
  }
}
