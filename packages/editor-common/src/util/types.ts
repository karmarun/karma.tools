export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Unpromisify<T> = T extends Promise<infer U> ? U : T
