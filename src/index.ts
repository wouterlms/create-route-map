import {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  writeFileSync,
  watch,
} from 'fs'
import { join, basename, dirname } from 'path'

import template from './template'

interface Options {
  basePath: string
  outputPath: string
}

export default (options: Options) => {
  const { basePath, outputPath } = options

  let routeNames = []

  const getNamedRoutes = (routerIndexFilePath: string) => {
    const file = readFileSync(routerIndexFilePath, 'utf8')

    const indices = [...file.matchAll(/name: '(.*?)'/g)]
      .map((m) => [m.index, m.index + m[0].length])
    
    indices.forEach(([startIndex, endIndex]) => {
      const match = file.slice(startIndex, endIndex)

      // remove `name: '` and the trailing '
      // name: 'user-index', -> user-index
      const cleanedMatch = match.slice(7, match.length - 1)

      routeNames.push(cleanedMatch)
    })
  }

  const findRouteDirectories = (src = basePath) => {
    readdirSync(src).forEach((entry) => {
      if (statSync(join(src, entry)).isDirectory()) {
        if (entry === 'router') {
          const routerIndexFile = existsSync(join(src, entry, 'index.ts'))

          if (routerIndexFile) {
            // getNamedRoutes(`${src}/${entry}/index.ts`)
            const routes = getNamedRoutes(join(src, entry, 'index.ts'))
          }
        } else {
          findRouteDirectories(join(src, entry))
        }
      }
    })
  }

  const createOutputFile = () => {
    const output = template(routeNames)
    writeFileSync(outputPath, output)
  }

  const sync = () => {
    routeNames = []
    findRouteDirectories()
    createOutputFile()
  }

  return {
    name: 'create-route-map',
    config(_, { command }) {
      if (command === 'serve') {
        watch(basePath, { recursive: true }, (_, filePath) => {
          const parentDir = basename(dirname(filePath))
      
          if (parentDir === 'router') {
            sync()
          }
        })
      }
    },
  }
}
