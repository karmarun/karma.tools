export class KarmaAPIError extends Error {
  public toString() {
    return `${this.constructor.name}: ${this.message}`
  }
}

export class PermissionDeniedError extends KarmaAPIError {
  constructor(readonly message: string) {
    super(`Permission denied: ${message}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class CompilationError extends KarmaAPIError {
  constructor(readonly message: string, readonly program?: any, readonly context?: any) {
    super(
      `Compilation error: ${JSON.stringify(
        {
          message: message,
          program: program,
          context: context
        },
        null,
        2
      )}`
    )
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ObjectNotFoundError extends KarmaAPIError {
  constructor(readonly model: string, readonly id: string) {
    super(`Object not found: ${model}, ${id}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ModelNotFoundError extends KarmaAPIError {
  constructor(readonly id: string) {
    super(`Model not found: ${id}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ExecutionError extends KarmaAPIError {
  constructor(readonly message: string, readonly context?: any) {
    super(
      JSON.stringify(
        {
          message: message,
          context: context
        },
        null,
        2
      )
    )
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class InvalidRequestError extends KarmaAPIError {
  constructor(readonly message: string) {
    super(message)
  }
}

export class UnknownError extends KarmaAPIError {
  constructor(readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
