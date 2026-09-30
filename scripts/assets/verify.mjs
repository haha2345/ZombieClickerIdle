import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve, sep } from 'node:path'

const root = process.cwd()
const catalog = JSON.parse(await readFile(resolve(root, 'art/catalog.json'), 'utf8'))
let checked = 0
for (const asset of [...catalog.references,...catalog.runtimeAssets]) {
  const target = resolve(root, asset.path)
  if (!target.startsWith(root + sep)) throw new Error(`路径越界：${asset.path}`)
  const bytes = await readFile(target)
  const hash = createHash('sha256').update(bytes).digest('hex')
  if (hash !== asset.sha256) throw new Error(`来源文件哈希不匹配：${asset.path}`)
  checked++
}
console.log(`素材哈希校验通过：${checked} 个文件。运行时素材：${catalog.runtimeAssets.length} 个。`)
