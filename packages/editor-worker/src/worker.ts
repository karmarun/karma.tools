import * as bcryptjs from 'bcryptjs'
import {WorkerTypeMap} from '@karma.run/editor-common'
import {createWorker} from './createWorker'

createWorker<WorkerTypeMap>('Worker', {
  hash: options => {
    const salt = bcryptjs.genSaltSync(options.costFactor)
    return bcryptjs.hashSync(options.value, salt)
  },

  salt: options => {
    return bcryptjs.genSaltSync(options.costFactor)
  }
})
