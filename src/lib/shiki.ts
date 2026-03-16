import { createJavaScriptRegexEngine } from 'shiki'
import { createHighlighterCore } from 'shiki/core'
import type { StringLiteralUnion } from 'shiki'

const highlighterPromise = createHighlighterCore({
  themes: [
    import('@shikijs/themes/vitesse-dark'),
    import('@shikijs/themes/night-owl-light'),
  ],
  langs: [
    import('@shikijs/langs/typescript'),
    import('@shikijs/langs/javascript'),
    import('@shikijs/langs/shell'),
    import('@shikijs/langs/json'),
    import('@shikijs/langs/python'),
    import('@shikijs/langs/go'),
  ],
  engine: createJavaScriptRegexEngine(),
})

export async function highlightCode(
  code: string,
  lang: StringLiteralUnion<string, string>,
  theme: 'light' | 'dark' | undefined,
) {
  const highlighter = await highlighterPromise

  return highlighter.codeToHtml(code, {
    theme: theme === 'light' ? 'night-owl-light' : 'vitesse-dark',
    lang,
  })
}
