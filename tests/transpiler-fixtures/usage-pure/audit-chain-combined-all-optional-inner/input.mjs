// fully-optional chain where the combine's inner receiver is itself a polyfilled optional call
// (`arr?.flat?.()`): the inner method must still be polyfilled inside the memoized receiver rather
// than dropped. the receiver subtree is left visitable so its own polyfill emits
arr?.flat?.()?.map?.()?.filter?.();
