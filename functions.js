const fs = require("fs");
const path = require("path");
const util = require("util");
var lib = {
  scan: {
    pathObject: function pathObject(projectDirectory, desiredExtensions) {
      const projectFiles = {};

      const walkSync = function (dir, filelist) {
        const files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
          if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
          } else {
            const fileExtension = path.extname(file);
            if (desiredExtensions.includes(fileExtension)) {
              filelist.push(path.join(dir, file));
              if (!projectFiles[dir]) {
                projectFiles[dir] = [];
              }
              projectFiles[dir].push(path.join(dir, file));
            }
          }
        });
        return filelist;
      };

      walkSync(projectDirectory);
      return projectFiles;
    },

    filterPath_string: function filterPath_string(obj, str) {
      let newObj = {};
      for (let key in obj) {
        if (!key.includes(str)) {
          newObj[key] = obj[key];
        }
      }
      return newObj;
    },

    filterPath_JS_CSS: function filterPath_JS_CSS(projectFiles) {
      const filteredProjectFiles = {};
      for (const [directory, files] of Object.entries(projectFiles)) {
        const hasMainJS = files.some(
          (file) => path.basename(file) === "main.js"
        );
        const hasMainCSS = files.some(
          (file) => path.basename(file) === "main.css"
        );
        if (hasMainJS && hasMainCSS) {
          filteredProjectFiles[directory] = files;
        }
      }
      return filteredProjectFiles;
    },

    filterPath_const_export: function filterPath_const_export(obj) {
      const updatedObj = {};

      for (const directory in obj) {
        const filePaths = obj[directory].filter((path) => {
          // Read the first line of the file and check if it starts with "const" plus any word
          const firstLine = fs
            .readFileSync(path, "utf-8")
            .trim()
            .split("\n")[0];
          return /^const\s+\w+/i.test(firstLine);
        });

        // If the filtered array is not empty, update the object
        if (filePaths.length > 0) {
          updatedObj[directory] = filePaths;
        }
      }

      return updatedObj;
    },

    baseDirectories: function baseDirectories(path) {
      const allDirectories = fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
      });

      const removedDirs = [".vscode", ".git", "node_modules"];
      const directories = allDirectories.filter(
        (item) => !removedDirs.includes(item)
      );

      return directories;
    },
    allFilePaths: function allFilePaths(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(filePaths(filePath));
        } else {
          if (
            path.extname(filePath) === ".js" ||
            path.extname(filePath) === ".css"
          ) {
            results.push(filePath);
          }
        }
      });
      return results;
    },
  },

  read: {
    fileObject: function fileObject(filePath) {
      function extractLastVueComponentLine(str) {
        const lines = str.split("\n").reverse();
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith("Vue.component(")) {
            return lines[i].trim();
          }
        }
      }

      let jsString = fs.readFileSync(path.join(__dirname, filePath), "utf-8");

      let exportLine = extractLastVueComponentLine(jsString);

      let componentName;

      let regexVueComponent = /const\s+(\w+)/;

      let match = regexVueComponent.exec(jsString);
      if (match) {
        componentName = match[1];
      }

      // javascript copy entire line that strats with Vue.component

      jsString = jsString
        .split("\n")
        .filter((line) => !line.startsWith("Vue.component("))
        .join("\n");

      let jsBuffer = new Function(jsString + `; return ${componentName};`);
      let jsObject = jsBuffer();

      if (exportLine) {
        jsObject["exportLine"] = exportLine;
      }

      return jsObject;
    },

    componentName: function componentName(filePath) {
      let jsString = fs.readFileSync(path.join(__dirname, filePath), "utf-8");

      let componentName;

      let regexVueComponent = /const\s+(\w+)/;

      let match = regexVueComponent.exec(jsString);
      if (match) {
        componentName = match[1];
      }
      return componentName;
    },
  },

  write: {
    vueFiles: function vueFiles(filePaths) {
      filePaths.forEach((filePath) => {
        const dirname = path.dirname(filePath);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        fs.writeFileSync(filePath, "");
      });
    },
  },
};

module.exports = lib;
