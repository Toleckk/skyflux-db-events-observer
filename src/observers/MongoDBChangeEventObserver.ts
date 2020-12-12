import {ChangeEvent, ObjectId} from 'mongodb'
import {EventType, Observer} from '../types'
import {getEventType} from '../utils'

export abstract class MongoDBChangeEventObserver<T extends {_id: ObjectId} = {_id: ObjectId}>
  implements Observer {
  public abstract readonly events: EventType[]
  public abstract readonly collection: string

  async notify(event: ChangeEvent | ObjectId): Promise<void> {
    if (event instanceof ObjectId) {
      const doc = await this.resolveById(event)
      return doc ? this.onEntityChanged(doc) : undefined
    }

    const entity = this.extractEntity(event)

    if (!entity) return

    return this.onEntityChanged(entity)
  }

  private extractEntity(event: ChangeEvent): T | undefined {
    const type = getEventType(event)

    if (!type) return

    const _id: string | ObjectId = (event as any).documentKey._id

    if (type === 'delete') return ('fullDocument' in event ? event.fullDocument : {_id}) as T

    return (event as any).fullDocument
  }

  protected abstract resolveById(id: ObjectId): Promise<T | undefined | null>

  protected abstract onEntityChanged(entity: T): Promise<void> | void
}
