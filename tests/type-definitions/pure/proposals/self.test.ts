import $self from '@core-js/pure/full/self';

const ref: typeof globalThis = $self;

// @ts-expect-error
$self();
// @ts-expect-error
$self = {};
