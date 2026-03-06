import { createJavaScriptRegexEngine } from 'shiki'
import { createHighlighterCore } from 'shiki/core'
import type { StringLiteralUnion } from 'shiki'

const highlighterPromise = createHighlighterCore({
  themes: [import('@shikijs/themes/vitesse-dark')],
  langs: [
    import('@shikijs/langs/typescript'),
    import('@shikijs/langs/javascript'),
    import('@shikijs/langs/shell'),
    import('@shikijs/langs/json'),
  ],
  engine: createJavaScriptRegexEngine(),
})

export async function highlightCode(
  code: string,
  lang: StringLiteralUnion<string, string>,
) {
  const highlighter = await highlighterPromise

  return highlighter.codeToHtml(code, {
    theme: 'vitesse-dark',
    lang,
  })
}
