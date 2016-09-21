import { createAction } from './createAction'

const list = createAction('LIST_TODO')
const create = createAction('ADD_TODO')
const destroy = createAction('DESTROY_TODO')

export { create, list, destroy }
