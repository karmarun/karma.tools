export function set(key: string, obj: any) {
  try {
    localStorage.setItem(key, JSON.stringify(obj))
  } catch (err) {
    console.error(`Error while writing to LocalStorage: ${err.message}`)
  }
}

export function get(key: string): any {
  try {
    const json = localStorage.getItem(key)
    return json && JSON.parse(json)
  } catch (err) {
    return undefined
  }
}

export function remove(key: string) {
  localStorage.removeItem(key)
}

export function clear() {
  localStorage.clear()
}
