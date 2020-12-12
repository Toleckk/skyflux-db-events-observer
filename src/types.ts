import {ObjectId} from 'mongodb'

export interface Pub {
  publish(triggerName: string, payload: any): Promise<void>
}

export type EventType = 'insert' | 'update' | 'soft-delete' | 'delete'

export type EntityResolver<T extends {_id: ObjectId}> = {
  findOne(cond: {_id: ObjectId}): Promise<T | null>
}

export interface Observer {
  notify(...args: unknown[]): unknown
}

export interface Observable {
  subscribe(observer: Observer): this
  unsubscribe(observer: Observer): this
}

export interface Event {
  _id: ObjectId
}

export interface User {
  _id: ObjectId
}

export interface Sub {
  _id: ObjectId
  from: User['_id']
  to: User['_id']
}

export interface Post {
  _id: ObjectId
  user: User['_id']
}

export interface Comment {
  _id: ObjectId
  user: User['_id']
  post: Post['_id']
}

export interface Like {
  _id: ObjectId
  user: User['_id']
  post: Post['_id']
}
