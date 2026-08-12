import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `core-js-disable-next-line` covers the WHOLE multi-line statement it precedes, at any nesting depth.
// The scan behind that span used to stop at a fixed node budget - about sixteen levels of nested callbacks -
// and from there down the opt-out was silently revoked, injecting on a line the user had disabled. The
// second statement is the enabled control: it must keep its injection at the same depth.
import { cb, wrap, src } from 'lib';
cb(function () {
  cb(function () {
    cb(function () {
      cb(function () {
        cb(function () {
          cb(function () {
            cb(function () {
              cb(function () {
                cb(function () {
                  cb(function () {
                    cb(function () {
                      cb(function () {
                        cb(function () {
                          cb(function () {
                            cb(function () {
                              cb(function () {
                                cb(function () {
                                  cb(function () {
                                    cb(function () {
                                      cb(function () {
                                        var _ref;
                                        // core-js-disable-next-line
                                        const disabled = wrap(Array.from(src));
                                        const enabled = wrap(_flatMaybeArray(_ref = [...src]).call(_ref));
                                        return [disabled, enabled];
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});