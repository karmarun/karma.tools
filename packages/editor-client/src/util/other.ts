export function expose(properties: any) {
  if (typeof window != 'undefined') {
    const anyWindow = window as any

    if (!anyWindow.editor) {
      anyWindow.editor = Object.create(null)
    }

    anyWindow.editor = Object.assign(anyWindow.editor, properties)
  }
}
