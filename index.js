const fs = require('fs');
const path = require('path');

const loaderUtils = require('loader-utils');
const babel = require('babel-core');
const ejs = require('ejs');

const util = require('atool-doc-util');

function calculateHtmlPath(cwd, source) {
  const selfPath = path.relative(cwd, source);
  return path.join(path.dirname(selfPath), `${path.basename(selfPath, path.extname(selfPath))}.html`);
}

module.exports = function(content) {
  this.cacheable && this.cacheable();

  const options = this.options;
  const resourcePath = this.resourcePath;

  const query = loaderUtils.parseQuery(this.query);

  const name = path.relative(options.cwd, resourcePath);

  const tpl = query.template;
  this.addDependency(tpl);

  const scripts = [
    path.relative(resourcePath, path.join(options.cwd, options.tplSource, 'common.js')),
    `${path.basename(resourcePath, path.extname(resourcePath))}.js`,
  ];

  const html = ejs.render(fs.readFileSync(tpl, 'utf-8'), {
    file: {
      title: name,
      script: scripts,
      desc: util.marked([{
        type: 'h2',
        children: 'code',
      }, {
        type: 'code',
        props: {
          lang: 'js',
        },
        children: content,
      }]),
    },
  });

  this.emitFile(calculateHtmlPath(options.cwd, resourcePath), html);

  return `module.exports = ${babel.transform(content, {
    presets: ['es2015', 'react'],
  }).code}`;
}