import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {EntityResolver, EventType, Observer, Post, Pub} from '../types'

export class PostObserver extends MongoDBChangeEventObserver<Post> {
  readonly events: EventType[] = ['insert', 'delete', 'update']
  readonly collection = 'posts'

  constructor(
    private pub: Pub,
    private postRepository: EntityResolver<Post>,
    private userObserver: Observer,
  ) {
    super()
  }

  protected async onEntityChanged(post: Post): Promise<void> {
    await Promise.all([
      this.pub.publish('post', {
        postUpdated: post,
        postsUpdated: post,
        feedUpdated: post,
      }),
      this.userObserver.notify(post.user),
    ])
  }

  protected resolveById(_id: ObjectId): Promise<Post | null> {
    return this.postRepository.findOne({_id})
  }
}
