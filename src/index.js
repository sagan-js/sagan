import Store from './store'
import { extend as extendModel, BaseModel } from './model'
import { extend as extendCollection } from './collection'
import logger from './middleware/logger.middleware'

const middleware = {
    logger
}

export {
    Store,
    extendModel,
    BaseModel,
    extendCollection,
    middleware
}