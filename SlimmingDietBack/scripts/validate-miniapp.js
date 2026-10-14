const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..', '..');
const adminModules = path.join(appRoot, 'SlimmingDietAdmin', 'admin', 'node_modules');
const babelParser = require(path.join(adminModules, '@babel', 'parser'));
const { parse, compileTemplate } = require(path.join(adminModules, '@vue', 'compiler-sfc'));

function listVueFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? listVueFiles(target) : entry.name.endsWith('.vue') ? [target] : [];
    });
}

const errors = [];
for (const file of listVueFiles(path.join(appRoot, 'pages'))) {
    const source = fs.readFileSync(file, 'utf8');
    const parsed = parse(source, { filename: file });
    const descriptor = parsed.descriptor || parsed;
    if (parsed.errors && parsed.errors.length) errors.push(...parsed.errors.map(error => `${file}: ${error.message || error}`));
    if (descriptor.script) {
        try {
            babelParser.parse(descriptor.script.content, { sourceType: 'module', plugins: ['optionalChaining', 'objectRestSpread'] });
        } catch (error) {
            errors.push(`${file}:${error.loc.line}:${error.loc.column} ${error.message}`);
        }
    }
    if (descriptor.template) {
        const result = compileTemplate({ source: descriptor.template.content, filename: file, id: file });
        errors.push(...result.errors.map(error => `${file}: ${error.message || error}`));
    }
}

const pageConfig = JSON.parse(fs.readFileSync(path.join(appRoot, 'pages.json'), 'utf8'));
for (const page of pageConfig.pages) {
    const file = path.join(appRoot, `${page.path}.vue`);
    if (!fs.existsSync(file)) errors.push(`pages.json 引用了不存在的页面: ${page.path}`);
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
} else {
    console.log(`前端静态校验通过：${pageConfig.pages.length} 个页面`);
}
