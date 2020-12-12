import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {EntityResolver, EventType, Like, Observer, Pub} from '../types'

export class LikeObserver extends MongoDBChangeEventObserver<Like> {
  readonly events: EventType[] = ['insert', 'delete']
  readonly collection = 'likes'

  constructor(
    private pub: Pub,
    private likeRepository: EntityResolver<Like>,
    private postObserver: Observer,
  ) {
    super()
  }

  protected async onEntityChanged(like: Like): Promise<void> {
    await Promise.all([
      this.pub.publish('like', {likeUpdated: like}),
      this.postObserver.notify(like.post),
    ])
  }

  protected resolveById(_id: ObjectId): Promise<Like | undefined | null> {
    return this.likeRepository.findOne({_id})
  }
}
