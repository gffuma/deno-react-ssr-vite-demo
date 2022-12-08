import { Plugin } from 'vite'

// Very stupid implementation to handle simple use cases
// ... and without the overhead of use an AST parser
const denoHackRe =
  /((const|let)\s+([^= ]+)\s*=\s*)?(__vite_import)\s*\((('[^']*')|("[^"]*"))(\s*,\s*(import\.meta\.url))?\s*\)/gm

function replacer(
  _match: string,
  _p1: string,
  _p2: string,
  identifier: string,
  _p4: string,
  source: string
) {
  if (identifier) {
    return `import ${identifier} from ${source}`
  }
  return `import ${source}`
}

export default function denoImport(): Plugin {
  return {
    name: 'deno-import',
    transform(code) {
      if (!code.includes('__vite_import')) return
      return {
        code: code.replace(denoHackRe, replacer),
        map: null,
      }
    },
  }
}
