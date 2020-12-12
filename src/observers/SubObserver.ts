import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {EntityResolver, EventType, Observer, Pub, Sub} from '../types'

export class SubObserver extends MongoDBChangeEventObserver<Sub> {
  readonly events: EventType[] = ['insert', 'delete', 'update']
  readonly collection = 'subs'

  constructor(
    private pub: Pub,
    private subRepository: EntityResolver<Sub>,
    private userObserver: Observer,
  ) {
    super()
  }

  protected async onEntityChanged(sub: Sub): Promise<void> {
    await Promise.all([
      this.pub.publish('sub', {subsUpdated: sub}),
      this.userObserver.notify(sub.from),
      this.userObserver.notify(sub.to),
    ])
  }

  protected resolveById(_id: ObjectId): Promise<Sub | null> {
    return this.subRepository.findOne({_id})
  }
}
