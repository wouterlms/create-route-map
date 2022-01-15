"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const template_1 = __importDefault(require("./template"));
exports.default = (options) => {
    const { svgFolderPath, outputPath } = options;
    const toCamelCase = (str) => str.replace(/-\w/g, (x) => `${x[1].toUpperCase()}`);
    const generateObjectContent = (files) => {
        const objectContent = files.map((fileName) => {
            const fileNameWithoutExtension = fileName.split('.')[0];
            let content = (0, fs_1.readFileSync)((0, path_1.join)(svgFolderPath, fileName), 'utf-8');
            // Remove enters
            content = content.replace(/(\r\n|\n|\r)/gm, '');
            return `${toCamelCase(fileNameWithoutExtension)}: '${content}'`;
        });
        return objectContent;
    };
    const generateEnumContent = (files) => {
        const svgContent = files.map((fileName) => {
            const fileNameWithoutExtension = fileName.split('.')[0];
            const uppercaseFileName = fileNameWithoutExtension.replace(/-/g, '_').toUpperCase();
            return `${uppercaseFileName} = '${toCamelCase(fileNameWithoutExtension)}'`;
        });
        return svgContent;
    };
    const generateOutput = () => {
        const files = (0, fs_1.readdirSync)(svgFolderPath)
            .filter((entry) => !(0, fs_1.statSync)((0, path_1.join)(svgFolderPath, entry)).isDirectory());
        const svgObjectContent = generateObjectContent(files);
        const svgEnumContent = generateEnumContent(files);
        const output = (0, template_1.default)(svgObjectContent, svgEnumContent);
        (0, fs_1.writeFileSync)(outputPath, output);
    };
    return {
        name: 'svg-transformer',
        config(_, { command }) {
            if (command === 'serve') {
                (0, fs_1.watch)(svgFolderPath, generateOutput);
            }
        },
    };
};
//# sourceMappingURL=index.js.map