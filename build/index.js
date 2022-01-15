"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const template_1 = __importDefault(require("./template"));
exports.default = (options) => {
    const { basePath, outputPath } = options;
    let routeNames = [];
    const getNamedRoutes = (routerIndexFilePath) => {
        const file = (0, fs_1.readFileSync)(routerIndexFilePath, 'utf8');
        const indices = [...file.matchAll(/name: '(.*?)'/g)]
            .map((m) => [m.index, m.index + m[0].length]);
        indices.forEach(([startIndex, endIndex]) => {
            const match = file.slice(startIndex, endIndex);
            // remove `name: '` and the trailing '
            // name: 'user-index', -> user-index
            const cleanedMatch = match.slice(7, match.length - 1);
            routeNames.push(cleanedMatch);
        });
    };
    const findRouteDirectories = (src = basePath) => {
        (0, fs_1.readdirSync)(src).forEach((entry) => {
            if ((0, fs_1.statSync)((0, path_1.join)(src, entry)).isDirectory()) {
                if (entry === 'router') {
                    const routerIndexFile = (0, fs_1.existsSync)((0, path_1.join)(src, entry, 'index.ts'));
                    if (routerIndexFile) {
                        // getNamedRoutes(`${src}/${entry}/index.ts`)
                        const routes = getNamedRoutes((0, path_1.join)(src, entry, 'index.ts'));
                    }
                }
                else {
                    findRouteDirectories((0, path_1.join)(src, entry));
                }
            }
        });
    };
    const createOutputFile = () => {
        const output = (0, template_1.default)(routeNames.sort((a, b) => a > b ? 1 : -1));
        (0, fs_1.writeFileSync)(outputPath, output);
    };
    const sync = () => {
        routeNames = [];
        findRouteDirectories();
        createOutputFile();
    };
    return {
        name: 'create-route-map',
        config(_, { command }) {
            if (command === 'serve') {
                (0, fs_1.watch)(basePath, { recursive: true }, (_, filePath) => {
                    const parentDir = (0, path_1.basename)((0, path_1.dirname)(filePath));
                    if (parentDir === 'router') {
                        sync();
                    }
                });
            }
        },
    };
};
//# sourceMappingURL=index.js.map