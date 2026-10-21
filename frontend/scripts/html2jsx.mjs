// html2jsx: a design shell (web/<app>/shell.html) → React components, the same DOM.
//
//   node scripts/html2jsx.mjs student-mobile
//
// The browser parses the shell (DOMParser in chrome-headless-shell, so the tree is exactly the one the browser builds from the file, implicit
// elements and all), and every node is written back as JSX: the same elements, attributes and order, every text node byte for byte
// (whitespace included, as a string literal when it is not plain), comments dropped. The shell's {{PLACEHOLDERS}} become props (p.NAME),
// inside text and attributes, as one text node. Each top-level region of the shell becomes its own component file in
// components/<app>/gen/, plus Shell.tsx composing them in order and scripts.json (the design scripts the shell loads, in order).
//
// A region listed in PORTED (components/<app>/ported/<Name>.tsx exists) is not generated: Shell.tsx imports the hand-ported one instead.
// Re-running this overwrites gen/ only; never edit gen/ by hand (copy a region to ported/ and edit it there).
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CHROME = process.env.SMOKE_CHROME ?? 'D:/tools/chs/chrome-headless-shell/win64-154.0.8037.92/chrome-headless-shell-win64/chrome-headless-shell.exe'
const here = path.dirname(fileURLToPath(import.meta.url)), app = path.resolve(here, '..')
const NAME = process.argv[2] ?? 'student-mobile'
const html = readFileSync(path.join(app, 'web', NAME, 'shell.html'), 'utf8')   // frontend/web: the legacy web/ (scripts/sync-design.mjs)
const OUT = process.env.HTML2JSX_OUT ? path.resolve(process.env.HTML2JSX_OUT) : path.join(app, 'components', NAME, 'gen'), PORTED_DIR = path.join(app, 'components', NAME, 'ported')

// ── 1. the browser's tree ──
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
const tree = await page.evaluate((src) => {
  const doc = new DOMParser().parseFromString(src, 'text/html')
  const walk = (n) => {
    if (n.nodeType === 3) return { t: n.data }
    if (n.nodeType !== 1) return null
    const kids = n.localName === 'template' ? n.content.childNodes : n.childNodes
    return { e: n.localName, ns: n.namespaceURI, a: [...n.attributes].map(x => [x.name, x.value]), c: [...kids].map(walk).filter(Boolean) }
  }
  return { body: walk(doc.body), title: doc.title, head: [...doc.head.children].map(walk) }
}, html)
await browser.close()

// ── 2. JSX ──
const PH = /\{\{([A-Z0-9_]+)\}\}/g
const hasPH = (s) => /\{\{[A-Z0-9_]+\}\}/.test(s)
const props = new Set()
const NUM = new Set(['tabindex', 'maxlength', 'minlength', 'rows', 'cols', 'colspan', 'rowspan', 'size', 'span', 'start'])
const BOOL = new Set(['checked', 'selected', 'hidden','disabled', 'required', 'multiple', 'open', 'readonly', 'autofocus', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'novalidate', 'formnovalidate', 'allowfullscreen', 'inert', 'async', 'defer', 'reversed', 'default', 'itemscope', 'nomodule'])
const RENAME = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', crossorigin: 'crossOrigin', autocomplete: 'autoComplete', autocapitalize: 'autoCapitalize',
  spellcheck: 'spellCheck', maxlength: 'maxLength', minlength: 'minLength', readonly: 'readOnly', inputmode: 'inputMode', enterkeyhint: 'enterKeyHint',
  autofocus: 'autoFocus', playsinline: 'playsInline', autoplay: 'autoPlay', contenteditable: 'contentEditable', srcset: 'srcSet', colspan: 'colSpan',
  rowspan: 'rowSpan', novalidate: 'noValidate', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', datetime: 'dateTime', accesskey: 'accessKey',
  referrerpolicy: 'referrerPolicy', fetchpriority: 'fetchPriority', popovertarget: 'popoverTarget', formnovalidate: 'formNoValidate', 'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', 'xmlns:xlink': 'xmlnsXlink', checked: 'defaultChecked', value: 'defaultValue',
  viewbox: 'viewBox', preserveaspectratio: 'preserveAspectRatio' }
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const propName = (n) => (RENAME[n] ?? (n.startsWith('data-') || n.startsWith('aria-') ? n : n.includes('-') || n.includes(':') ? camel(n.replace(':', '-')) : n))
const lit = (s) => JSON.stringify(s)
/** "text {{A}} more" → `text ${p.A} more` (one string, so one text node); plain strings as a literal */
function expr(s) {
  if (!hasPH(s)) return lit(s)
  return '`' + s.replace(/[`\\]|\$\{/g, (c) => '\\' + c).replace(PH, (_, k) => { props.add(k); return '${p.' + k + '}' }) + '`'
}
function styleObj(css) {
  const parts = [], out = []
  let cur = '', depth = 0, q = ''
  for (const ch of css) {
    if (q) { cur += ch; if (ch === q) q = ''; continue }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue }
    if (ch === '(') depth++; if (ch === ')') depth--
    if (ch === ';' && depth === 0) { parts.push(cur); cur = ''; continue }
    cur += ch
  }
  parts.push(cur)
  for (const d of parts) {
    const i = d.indexOf(':'); if (i < 0) continue
    const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim(); if (!k) continue
    const key = k.startsWith('--') ? k : k.startsWith('-ms-') ? camel(k.slice(1)) : k.startsWith('-') ? camel(k.slice(1)).replace(/^./, c => c.toUpperCase()) : camel(k)
    out.push(`${lit(key)}: ${expr(v)}`)
  }
  return `{{ ${out.join(', ')} }}`
}
function attrs(a) {
  return a.map(([n, v]) => {
    if (n === 'style') return ` style=${styleObj(v)}`
    // the parent shells' {{P_X_ATTR}} stand where an attribute does: '' or ' hidden' (src/server/pages.ts fillParent). The browser
    // lowercased the name; the prop is the placeholder's own
    const at = /^\{\{([a-z0-9_]+_attr)\}\}$/.exec(n)
    if (at) { const k = at[1].toUpperCase(); props.add(k); return ` hidden={p.${k} === ' hidden'}` }
    const name = propName(n)
    if (BOOL.has(n) && (v === '' || v.toLowerCase() === n)) return ` ${name}`
    if (NUM.has(n) && /^-?\d+$/.test(v)) return ` ${name}={${v}}`
    return ` ${name}=${hasPH(v) ? `{${expr(v)}}` : /["\\{}<>\n]/.test(v) ? `{${lit(v)}}` : `"${v}"`}`
  }).join('')
}
const NO_TEXT = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'select'])   // React refuses whitespace text inside these
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const plain = (s) => /^[^{}<>&\s][^{}<>&\n\t]*$/.test(s) && !/\s$/.test(s) && !/ {2}/.test(s) && !hasPH(s)
/** hooks a hand-port puts on generated nodes: [data-clock] gets the study clock's value (public/d/student-mobile/js/001.js, ported) */
function special(n) {
  if (NAME !== 'student-mobile') return null   // the hooks below are the phone app's ports and renderPage's phone-only rule
  const clock = n.a.find(([k]) => k === 'data-clock')
  if (clock) return `{clock.${clock[1]}}`
  // src/server/pages.ts: a live student's line under the name on the phone is SB_ROLE (the teen walk of 10 Oct 2026), the design's otherwise
  if (n.e === 'p' && n.c.length === 1 && n.c[0].t === 'College applicant') return '{p.WHO_LINE}'
  return null
}
function jsx(n, ind, parent) {
  if (n.t !== undefined) {
    if (NO_TEXT.has(parent) && !n.t.trim()) return ''
    return plain(n.t) ? n.t : `{${expr(n.t)}}`
  }
  if (n.e === 'script') return ''
  const pad = '  '.repeat(ind), open = `<${n.e}${attrs(n.a)}`
  if (VOID.has(n.e)) return `${open} />`
  const hook = special(n)
  if (hook) return `${open}>${hook}</${n.e}>`
  // a {{X_HTML}} placeholder is markup built by the server (fillParent's row lists): the element's whole content, as markup
  const texts = n.c.filter(c => c.t !== undefined), elems = n.c.filter(c => c.e)
  if (!elems.length && texts.length && /\{\{[A-Z0-9_]+_HTML\}\}/.test(texts.map(c => c.t).join(''))) {
    return `${open} dangerouslySetInnerHTML={{ __html: ${expr(texts.map(c => c.t).join(''))} }} />`
  }
  // adjacent text nodes (a dropped comment between them) are one text node again
  const kids = []
  for (const c of n.c) { if (c.t !== undefined && kids.length && kids[kids.length - 1].t !== undefined) kids[kids.length - 1] = { t: kids[kids.length - 1].t + c.t }; else kids.push(c) }
  if (!kids.length) return `${open}></${n.e}>`
  const inner = kids.map(c => jsx(c, ind + 1, n.e)).filter(s => s !== '')
  if (inner.length === 1 && !inner[0].includes('\n') && inner[0].length < 100) return `${open}>${inner[0]}</${n.e}>`
  return `${open}>\n${inner.map(s => pad + '  ' + s).join('\n')}\n${pad}</${n.e}>`
}

// ── 3. regions: the top-level elements of <body> (and of its one wrapper, .device), one component each ──
const scripts = []
const collectScripts = (n) => { if (n.e === 'script') { const s = n.a.find(([k]) => k === 'src'); if (s) scripts.push(s[1]) } (n.c || []).forEach(collectScripts) }
collectScripts(tree.body)
const body = tree.body
const device = body.c.find(c => c.e === 'div' && c.a.some(([k, v]) => k === 'class' && v.split(/\s+/).includes('device')))
const nameOf = (n, i) => {
  const id = n.a.find(([k]) => k === 'id')?.[1], cls = n.a.find(([k]) => k === 'class')?.[1]?.split(/\s+/)[0]
  const base = (id || cls || n.e).replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^./, c => c.toUpperCase())
  return `R${String(i).padStart(2, '0')}${base}`
}
const ported = existsSync(PORTED_DIR) ? new Set(readdirSync(PORTED_DIR).filter(f => f.endsWith('.tsx')).map(f => f.replace(/\.tsx$/, ''))) : new Set()
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const header = (what) => `// GENERATED by scripts/html2jsx.mjs from web/${NAME}/shell.html (${what}). Do not edit: copy to ../ported/ and edit there.\n/* eslint-disable */\n`
const regions = []
function emitRegion(n, i, where) {
  const name = nameOf(n, i)
  regions.push({ name, where, ported: ported.has(name) })
  if (ported.has(name)) return
  props.clear()
  const code = jsx(n, 2, where)
  const usesClock = code.includes('{clock.')
  writeFileSync(path.join(OUT, `${name}.tsx`), header(`region ${i}`) +
    `import type { RegionProps } from '../props'\n\nexport default function ${name}({ p${usesClock ? ', clock' : ''} }: RegionProps) {\n  return (\n    ${code}\n  )\n}\n`)
}
let i = 0
const bodyKids = [], deviceKids = []
for (const c of body.c) {
  if (c === device) { for (const d of device.c) { if (d.e && d.e !== 'script') { emitRegion(d, ++i, 'device'); deviceKids.push(regions.at(-1)) } else if (d.t !== undefined) deviceKids.push({ text: d.t }) } }
  else if (c.e && c.e !== 'script') { emitRegion(c, ++i, 'body'); bodyKids.push(regions.at(-1)) }
}
const imp = regions.map(r => `import ${r.name} from '${r.ported ? '../ported/' : './'}${r.name}'`).join('\n')
const use = (r) => (r.text !== undefined ? (r.text.trim() ? `{${lit(r.text)}}` : `{${lit(r.text)}}`) : `<${r.name} p={p} clock={clock} />`)
const deviceAttrs = device ? attrs(device.a) : ''
writeFileSync(path.join(OUT, 'Shell.tsx'), header('the page body') +
  `import type { ShellProps } from '../props'\n${imp}\n\n/** The page body in the shell's order. clock: the study clock (001.js, ported into render). */\nexport default function Shell({ p }: { p: ShellProps }) {\n  const clock = p.clock\n  return (\n    <>\n${device ? `      <div${deviceAttrs}>\n${deviceKids.map(r => '        ' + use(r)).join('\n')}\n      </div>\n` : ''}${bodyKids.map(r => '      ' + use(r)).join('\n')}\n    </>\n  )\n}\n`)
// the shell's own head, after renderPage's slot: its title (with placeholders) and its links (icons, font preconnects, fonts, the stylesheet), in order
const links = tree.head.filter(n => n && n.e === 'link').map(n => Object.fromEntries(n.a.map(([k, v]) => [k === 'crossorigin' ? 'crossOrigin' : k, v])))
writeFileSync(path.join(OUT, 'scripts.json'), JSON.stringify({ title: tree.title, links, scripts }, null, 1))
const all = new Set(); for (const f of readdirSync(OUT)) { for (const m of readFileSync(path.join(OUT, f), 'utf8').matchAll(/p\.([A-Z0-9_]+)/g)) all.add(m[1]) }
console.log(`${NAME}: ${regions.length} regions (${regions.filter(r => r.ported).length} ported), ${scripts.length} scripts, props: ${[...all].sort().join(' ')}`)
