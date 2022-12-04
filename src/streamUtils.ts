export function stringToStream(str: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str))
      controller.close()
    },
  })
}

export function createBeforeTagStreamTransformer(
  token: string,
  oneTime: boolean,
  inject: () => string
) {
  let injected = false

  return new TransformStream({
    transform(chunk, controller) {
      if (!oneTime || !injected) {
        const content = new TextDecoder().decode(chunk)
        let index
        if ((index = content.indexOf(token)) !== -1) {
          const newContent =
            content.slice(0, index) +
            inject() +
            content.slice(index, content.length)
          injected = true
          controller.enqueue(new TextEncoder().encode(newContent))
          return
        }
      }
      controller.enqueue(chunk)
    },
  })
}

export function createAfterTagStreamTransformer(
  token: string,
  inject: () => string,
  oneTime = true
) {
  let injected = false

  return new TransformStream({
    transform(chunk, controller) {
      if (!oneTime || !injected) {
        const content = new TextDecoder().decode(chunk)
        let index
        if ((index = content.indexOf(token)) !== -1) {
          const newContent =
            content.slice(0, index + token.length) +
            inject() +
            content.slice(index + token.length, content.length)
          injected = true
          controller.enqueue(new TextEncoder().encode(newContent))
          return
        }
      }
      controller.enqueue(chunk)
    },
  })
}

export function createEndStreamTransformer(inject: () => string) {
  return new TransformStream({
    flush(controller) {
      controller.enqueue(new TextEncoder().encode(inject()))
    },
    transform(chunk, controller) {
      controller.enqueue(chunk)
    },
  })
}
