export class KarmaAPIError extends Error {
  constructor(readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toString() {
    return this.message ? `${this.constructor.name}: ${this.message}` : `${this.constructor.name}`
  }
}

export class PermissionDeniedError extends KarmaAPIError {
  constructor(readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class CompilationError extends KarmaAPIError {
  constructor(
    readonly message: string,
    readonly problem?: string,
    readonly program?: string,
    readonly context?: any
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ObjectNotFoundError extends KarmaAPIError {
  constructor(readonly model: string, readonly id: string) {
    super(`${model}, ${id}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ModelNotFoundError extends KarmaAPIError {
  constructor(readonly id: string) {
    super(id)
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
  constructor(readonly message: string, readonly context?: any) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MigrationError extends KarmaAPIError {
  constructor(readonly underlyingError: KarmaAPIError, readonly query: object) {
    super(underlyingError.message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class JSONError extends KarmaAPIError {
  constructor(readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

type MachineErrorJSON = {
  compilationError: {
    problem: string
    program: string
    context?: any
  }
  requestError: {}
  permissionDeniedError: {}
}

type ErrorJSON = {
  humanReadableError?: {
    human: string
    machine: MachineErrorJSON
  }
} & MachineErrorJSON

export type JSONErrorType = keyof MachineErrorJSON

export function decodeError(json: ErrorJSON): KarmaAPIError {
  let machineError: MachineErrorJSON
  let message: string = ''

  if (!json.humanReadableError) {
    machineError = json
  } else {
    message = json.humanReadableError.human
    machineError = json.humanReadableError.machine
  }

  const type = Object.keys(machineError)[0] as JSONErrorType

  switch (type) {
    case 'compilationError':
      return new CompilationError(
        message,
        machineError.compilationError.problem,
        machineError.compilationError.program,
        machineError.compilationError.context
      )

    case 'permissionDeniedError':
      return new PermissionDeniedError(message)

    default:
      return new UnknownError(message || type, machineError)
  }
}
