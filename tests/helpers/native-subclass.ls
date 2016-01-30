Function('return this')!nativeSubclass = try Function \F """
  'use strict';
  class G extends F {};
  return G;
  """