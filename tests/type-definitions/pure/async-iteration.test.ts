import from from '@core-js/pure/full/async-iterator/from';

const aitn = from([1]);
for await (const v of aitn) {
}
