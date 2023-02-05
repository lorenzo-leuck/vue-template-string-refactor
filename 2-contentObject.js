const fs = require("fs");
const path = require("path");
const util = require("util");

function contentObject(fileObject, css) {
  function extractFunctionString(fn) {
    let str = fn.toString();
    const startIndex = str.indexOf("function(){") + "function(){".length;
    const endIndex = str.lastIndexOf("}");
    return str.slice(startIndex, endIndex).trim();
  }

  function extractCurlyBrackets(str) {
    const regex = /\{(.*)\}/s;
    const match = regex.exec(str);
    if (match) {
      return match[1];
    } else {
      return null;
    }
  }

  function isEmptyObject(obj) {
    if (!Object.keys(obj).length) {
      return "";
    } else {
      return obj;
    }
  }

  // template,props,data,computed,methods,created,mounted,watch,destroy

  // editedProps = fileObject.props.map((item) => `'${item}'`)

  let props = fileObject.props ? `props: [${fileObject.props}],` : null;
  let data = fileObject.data
    ? `
    data() {
        ${extractCurlyBrackets(fileObject.data)}
    },
    `
    : null;

  let computedsEntries = fileObject.computed
    ? Object.entries(fileObject.computed)
    : null;

  // javascript join computed with break line and comma

  let computedContent = fileObject.computed
    ? computedsEntries.map((currentValue) => {
        let keys = currentValue[0];
        let valueStrings = extractCurlyBrackets(currentValue[1]);

        return `${keys}() {
          ${valueStrings} 
        }`;
      })
    : null;

  let computed = fileObject.computed
    ? `
    computed: {
    ${computedContent.join(",\n")}
    },
    `
    : null;

  let methodsEntries = fileObject.methods
    ? Object.entries(fileObject.methods)
    : null;

  // javascript join method with break line and comma

  let methodContent = fileObject.methods
    ? methodsEntries.map((currentValue) => {
        let keys = currentValue[0];
        let valueStrings = extractCurlyBrackets(currentValue[1]);

        return `${keys}() {
        ${valueStrings} 
      }`;
      })
    : null;
  let methods = fileObject.methods
    ? `
    methods: {
${methodContent.join(",\n")}
    },
    `
    : null;
  let watch = fileObject.watch
    ? `
    watch: {
      ${Object.values(fileObject.watch)}
    },
    `
    : null;

  let created = fileObject.created
    ? `
    created() {
      ${extractCurlyBrackets(fileObject.mounted)}
    },
    `
    : null;

  let mounted = fileObject.mounted
    ? `
    mounted() {
      ${extractCurlyBrackets(fileObject.mounted)}
    },
    `
    : null;
  let destroy = fileObject.destroy
    ? `
    destroyed() {
      ${extractCurlyBrackets(fileObject.destroy)}
    }
    `
    : null;
  let scriptArray = [
    props,
    data,
    computed,
    methods,
    watch,
    created,
    mounted,
    destroy,
  ];

  let scriptContent = scriptArray.filter((a) => a).join("\n");
  let libImports = "";
  let serviceImports = "";
  let fileContent = `
<template>
${fileObject.template}
</template>

<style>
${css}
</style>

<script>
${libImports}
export default {
  ${serviceImports}
  ${scriptContent}
}
${fileObject.exportLine}
</script>


`;

  let script2 = `
<script>
${libImports}
export default {
  ${serviceImports}
  ${scriptContent}
}
${fileObject.exportLine}
</script>
`;

  return fileContent;
}

module.exports = contentObject;
