import IORedis from 'ioredis'
import {RedisPubAdapter} from './RedisPubAdapter'

export const pub = new RedisPubAdapter(
  new IORedis(process.env.REDIS_URL, {
    retryStrategy: (times: number): number => Math.min(times * 50, 2000),
  }),
)
