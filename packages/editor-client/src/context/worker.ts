import React from 'react'
import {createContextHOC} from './helper'

export interface WorkerContext {
  generateSalt(costFactor?: number): Promise<string>
  generateHash(value: string, costFactor?: number): Promise<string>
}

export const WorkerContext = React.createContext<WorkerContext>({
  generateHash() {
    throw new Error('No WorkerContext found!')
  },

  generateSalt() {
    throw new Error('No WorkerContext found!')
  }
})

export const withWorker = createContextHOC(WorkerContext, 'workerContext', 'withWorker')
