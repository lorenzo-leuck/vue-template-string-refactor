const fs = require("fs");
const path = require("path");
const functions = require("./functions.js");
const pathObject = require("./1-pathObject.js");
const contentObject = require("./2-contentObject.js");

function geral() {
  let componentPathArray = [];
  let allFileObjectKeysArray = [];
  let templateArray = [];

  Object.entries(pathObject).forEach(([key, value]) => {
    const JSFiles = value.filter((file) => {
      return file.endsWith(".js");
    });

    JSFiles.forEach((element) => {
      let fileObject = functions.read.fileObject(element);
      let fileObjectKeys = Object.keys(fileObject);
      allFileObjectKeysArray.push(fileObjectKeys);

      let componentName = functions.read.componentName(element);
      let changedBasePath = element.replace("1-static", "3-refactor");
      let componentPath = changedBasePath.replace(
        /\/[^\/]*$/,
        `/${componentName}.vue`
      );

      let filePathWithoutFile = element.substring(0, element.lastIndexOf("/"));
      let cssFiles = fs
        .readdirSync(filePathWithoutFile)
        .filter((file) => path.extname(file) === ".css");

      let cssContent =
        cssFiles.length === 0
          ? ""
          : cssFiles
              .map((file) =>
                fs.readFileSync(path.join(filePathWithoutFile, file))
              )
              .join("");
      console.log(cssContent);

      let template = contentObject(fileObject, cssContent);
      templateArray.push(template);
      componentPathArray.push([element, componentPath, template, cssContent]);
    });
  });

  function vueFiles(filePaths) {
    filePaths.forEach((filePath, index) => {
      const dirname = path.dirname(filePath[1]);

      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      console.log(index, filePath[0]);
      // let fileObject = functions.read.fileObject(filePath[0]);

      // let template = contentObject(fileObject);

      fs.writeFileSync(filePath[1], filePath[2]);
    });
  }

  vueFiles(componentPathArray);

  // console.log(templateArray[0]);

  // vueFiles(componentPathArray);

  // const flatten = (arr) =>
  //   arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

  // extendedFileObjectKeys = flatten(allFileObjectKeysArray);
  // const allFileObjectKeys = [...new Set(extendedFileObjectKeys)];
  // console.log(allFileObjectKeys);
}

function individual() {
  let element = "1-static/admin/js/controls/form-results.js";
  let fileObject = functions.read.fileObject(element);

  let componentName = functions.read.componentName(element);

  let css = fs.readFileSync("1-static/components/form-card/main.css", "utf-8");

  let template = contentObject(fileObject);

  fs.writeFileSync("FORCA.vue", template);
}

geral();
