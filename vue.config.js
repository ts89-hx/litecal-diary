const fs = require('fs');
const path = require('path');

// uni-app copies the legacy static directory in full. Exclude only assets with
// no reference in the emitted mini-program; keep every source file on disk.
class ExcludeUnusedMiniappStatic {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('ExcludeUnusedMiniappStatic', () => {
      const output = compiler.options.output.path;
      const configPath = path.join(output, 'project.config.json');
      if (!fs.existsSync(configPath)) return;
      const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });
      const files = walk(output);
      const code = files.filter(file => /\.(js|json|wxml|wxss)$/.test(file) && !path.basename(file).startsWith('project.'))
        .map(file => fs.readFileSync(file, 'utf8')).join('\n').replace(/\\\//g, '/');
      // Partial directory strings are kept too, for paths composed at runtime.
      const references = [...code.matchAll(/static\/[\w\u0080-\uFFFF./%+() -]*/g)].map(match => match[0]);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const unused = files.map(file => path.relative(output, file).replace(/\\/g, '/'))
        .filter(file => file.startsWith('static/') && !references.some(ref =>
          ref === file || ref === encodeURI(file) || (ref.endsWith('/') && file.startsWith(ref))));
      config.packOptions = config.packOptions || {};
      config.packOptions.ignore = [
        ...(config.packOptions.ignore || []).filter(rule => !(rule.type === 'file' && rule.value.startsWith('static/'))),
        ...unused.map(value => ({ type: 'file', value })),
      ];
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      console.log(`微信预览包排除 ${unused.length} 个未引用静态资源；源文件保留。`);
    });
  }
}

module.exports = {
  configureWebpack: process.env.UNI_PLATFORM === 'mp-weixin'
    ? { plugins: [new ExcludeUnusedMiniappStatic()] }
    : {},
};
