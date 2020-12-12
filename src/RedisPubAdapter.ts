import {ObjectId} from 'mongodb'
import {Redis} from 'ioredis'
import {Pub} from './types'

export class RedisPubAdapter implements Pub {
  constructor(private redis: Redis) {}

  async publish<T extends {_id: ObjectId}>(triggerName: string, payload: T): Promise<void> {
    await this.redis.publish(triggerName, JSON.stringify(payload))
  }
}
