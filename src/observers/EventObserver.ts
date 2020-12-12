import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {EntityResolver, Event, EventType, Pub} from '../types'

export class EventObserver extends MongoDBChangeEventObserver<Event> {
  readonly events: EventType[] = ['insert', 'delete', 'update']
  readonly collection = 'events'

  constructor(private pub: Pub, private eventRepository: EntityResolver<Event>) {
    super()
  }

  protected async onEntityChanged(event: Event): Promise<void> {
    await Promise.all([this.pub.publish('event', {eventUpdated: event})])
  }

  protected resolveById(_id: ObjectId): Promise<Event | undefined | null> {
    return this.eventRepository.findOne({_id})
  }
}
