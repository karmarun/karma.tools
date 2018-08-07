export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
  immediate: boolean
): T {
  let timeoutID: any

  return ((...args: any[]) => {
    const callNow = immediate && !timeoutID
    const later = () => {
      timeoutID = 0
      if (!immediate) fn(...args)
    }

    clearTimeout(timeoutID)
    timeoutID = setTimeout(later, wait)

    if (callNow) fn(...args)
  }) as T
}
