"use strict";

var rAmp = /&/g;
var rLt = /</g;
var rApos =/\'/g;
var rQuot = /\"/g;
var hChars =/[&<>\"\']/;

module.exports = function(str) {
  if (str == null) {
    return str;
  }

  if (typeof str !== "string") {
    str = String(str);
  }

  if (hChars.test(String(str))) {
    return str
      .replace(rAmp,'&amp;')
      .replace(rLt,'&lt;')
      .replace(rApos,'&apos;')
      .replace(rQuot, '&quot;');
  }
  else {
    return str;
  }
};
