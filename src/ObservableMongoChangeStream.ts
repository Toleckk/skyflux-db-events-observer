import {ChangeEvent, ChangeEventBase, ChangeStream} from 'mongodb'
import {EventType, Observable, Observer} from './types'
import {MongoDBChangeEventObserver} from './observers'
import {getEventType} from './utils'

export class ObservableMongoChangeStream implements Observable {
  constructor(private stream: ChangeStream) {}

  private readonly subscribers: Map<Observer, (e: ChangeEvent) => unknown> = new Map()

  subscribe(observer: MongoDBChangeEventObserver): this {
    if (this.subscribers.has(observer)) return this

    const listener = (e: ChangeEvent): unknown =>
      ObservableMongoChangeStream.isSubscribeOn(observer, e) && observer.notify(e)

    this.subscribers.set(observer, listener)

    this.stream.on('change', listener)
    return this
  }

  unsubscribe(observer: MongoDBChangeEventObserver): this {
    const listener = this.subscribers.get(observer)

    if (listener) this.stream.off('change', listener)

    return this
  }

  private static isSubscribeOn(observer: MongoDBChangeEventObserver, event: ChangeEvent): boolean {
    return (
      ObservableMongoChangeStream.isSubscribedOnCollection(
        observer,
        (event as ChangeEventBase).ns.coll,
      ) && ObservableMongoChangeStream.isEventOfType(observer.events, event)
    )
  }

  private static isSubscribedOnCollection(
    observer: MongoDBChangeEventObserver,
    collection: string,
  ): boolean {
    return observer.collection === collection
  }

  private static isEventOfType(eventType: EventType | EventType[], e: ChangeEvent): boolean {
    const type = getEventType(e)

    if (!type) return false

    return eventType === type || (Array.isArray(eventType) && eventType.includes(type))
  }
}
