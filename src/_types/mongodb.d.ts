import 'mongodb'
import type {ObjectId} from 'mongodb'

declare module 'mongodb' {
  export interface Collection<TSchema extends {[key: string]: any} = DefaultSchema> {
    findOne(filter: {_id: string | ObjectId}): Promise<TSchema | null>
  }
}
