const fs = require("fs");
const path = require("path");
const functions = require("./functions.js");
let jsPathObject_raw = functions.scan.pathObject("./1-static", [".js"]);
let pathObject_raw = functions.scan.pathObject("./1-static", [".js", ".css"]);

let jsPathObject_novendors = functions.scan.filterPath_string(
  jsPathObject_raw,
  "vendor"
);

let jsPathObject_onlyExport = functions.scan.filterPath_const_export(
  jsPathObject_novendors
);

const flatten = (arr) =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

let onlyExport = flatten(Object.values(jsPathObject_onlyExport));

function filterObjectValuesByArray(obj, arr) {
  const newObject = {};
  for (const key in obj) {
    const filteredFiles = obj[key].filter((file) => {
      return file.endsWith(".js") ? arr.includes(file) : true;
    });
    if (filteredFiles.length > 0) {
      newObject[key] = filteredFiles;
    }
  }
  return newObject;
}

let pathObject = filterObjectValuesByArray(pathObject_raw, onlyExport);

let pathObjectRaw_values = flatten(Object.values(pathObject_raw));
let newPathObject_values = flatten(Object.values(pathObject));

const diffArray = pathObjectRaw_values.filter(
  (value) => !newPathObject_values.includes(value)
);

// removes the values of the diffArray that contains the string "vendor"
const filteredDiffArray = diffArray.filter(
  (value) => !value.includes("vendor")
);

module.exports = pathObject;
