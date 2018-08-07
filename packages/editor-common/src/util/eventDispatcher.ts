export type EventHandler<T> = (data: T) => void
export class EventDispatcher<T extends object = {}> {
  protected eventHandlers = new Map<keyof T, Set<EventHandler<any>>>()

  public on<E extends keyof T>(event: E, handler: EventHandler<T[E]>) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }

    this.eventHandlers.get(event)!.add(handler)
  }

  public once<E extends keyof T>(event: E, handler: EventHandler<T[E]>) {
    const onceHandler: EventHandler<T[E]> = data => {
      this.off(event, onceHandler)
      handler.call(data)
    }

    this.on(event, onceHandler)
  }

  public off<E extends keyof T>(event: E, handler: EventHandler<T[E]>) {
    const handlers = this.eventHandlers.get(event)
    if (!handlers) return

    handlers.delete(handler)
  }

  public dispatch<E extends keyof T>(event: E, data: T[E]) {
    const handlers = this.eventHandlers.get(event)

    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }
}
