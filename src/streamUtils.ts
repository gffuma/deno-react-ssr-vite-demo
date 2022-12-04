export function stringToStream(str: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str))
      controller.close()
    },
  })
}

export type InjectHTMLFunction = () => string
export interface InjectHTMLHook {
  afterHeadOpen?: InjectHTMLFunction
  beforeHeadClose?: InjectHTMLFunction
  afterBodyOpen?: InjectHTMLFunction
  beforeBodyClose?: InjectHTMLFunction
  end?: InjectHTMLFunction
  // TODO: Before every react streaming scrpt 4 hydratation ....
}

function runInject(fns: InjectHTMLFunction[]) {
  return fns.reduce((html, fn) => html + fn(), '')
}

type NormalizedHooks = {
  [k in keyof Required<InjectHTMLHook>]: InjectHTMLFunction[]
}

function normalizeHooks(hooks: InjectHTMLHook[]) {
  const normalized: NormalizedHooks = {
    afterHeadOpen: [],
    beforeHeadClose: [],
    afterBodyOpen: [],
    beforeBodyClose: [],
    end: [],
  }

  hooks.reduce((out, hook) => {
    const keys = Object.keys(hook) as Array<keyof InjectHTMLHook>
    keys.forEach((k) => out[k].push(hook[k]!))
    return out
  }, normalized)

  return normalized
}

function insertStringAtIndex(
  content: string,
  index: number,
  value: string
): string {
  const newContent =
    content.slice(0, index) + value + content.slice(index, content.length)
  return newContent
}

export function createHTMLStreamTransformer(hooks: InjectHTMLHook[]) {
  const normalizedHooks = normalizeHooks(hooks)

  const hookInjectedOneTime = {
    beforeHeadClose: !normalizedHooks.beforeHeadClose.length,
    afterHeadOpen: !normalizedHooks.afterHeadOpen.length,
    afterBodyOpen: !normalizedHooks.afterBodyOpen.length,
    beforeBodyClose: !normalizedHooks.beforeBodyClose.length,
  }

  return new TransformStream({
    flush(controller) {
      if (normalizedHooks.end.length) {
        controller.enqueue(
          new TextEncoder().encode(runInject(normalizedHooks.end))
        )
      }
    },
    transform(chunk, controller) {
      let html: string | null = null
      let index: number
      let touch = false

      if (!hookInjectedOneTime.afterHeadOpen) {
        if (!html) html = new TextDecoder().decode(chunk)
        const token = '<head>'
        if ((index = html.indexOf(token)) !== -1) {
          html = insertStringAtIndex(
            html,
            index + token.length,
            runInject(normalizedHooks.afterHeadOpen)
          )
          hookInjectedOneTime.afterHeadOpen = true
          touch = true
        }
      }

      if (!hookInjectedOneTime.beforeHeadClose) {
        if (!html) html = new TextDecoder().decode(chunk)
        const token = '</head>'
        if ((index = html.indexOf(token)) !== -1) {
          html = insertStringAtIndex(
            html,
            index,
            runInject(normalizedHooks.beforeHeadClose)
          )
          hookInjectedOneTime.beforeHeadClose = true
          touch = true
        }
      }

      if (!hookInjectedOneTime.afterBodyOpen) {
        if (!html) html = new TextDecoder().decode(chunk)
        const token = '<body>'
        if ((index = html.indexOf(token)) !== -1) {
          html = insertStringAtIndex(
            html,
            index + token.length,
            runInject(normalizedHooks.afterBodyOpen)
          )
          hookInjectedOneTime.afterBodyOpen = true
          touch = true
        }
      }

      if (!hookInjectedOneTime.beforeBodyClose) {
        if (!html) html = new TextDecoder().decode(chunk)
        const token = '</body>'
        if ((index = html.indexOf(token)) !== -1) {
          html = insertStringAtIndex(
            html,
            index,
            runInject(normalizedHooks.beforeBodyClose)
          )
          hookInjectedOneTime.beforeBodyClose = true
          touch = true
        }
      }

      if (html !== null && touch) {
        controller.enqueue(new TextEncoder().encode(html))
      } else {
        controller.enqueue(chunk)
      }
    },
  })
}
