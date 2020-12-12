import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {Comment, EntityResolver, EventType, Observer, Pub} from '../types'

export class CommentObserver extends MongoDBChangeEventObserver<Comment> {
  readonly events: EventType[] = ['insert', 'delete', 'update']
  readonly collection = 'comments'

  constructor(
    private pub: Pub,
    private commentRepository: EntityResolver<Comment>,
    private postObserver: Observer,
  ) {
    super()
  }

  protected async onEntityChanged(comment: Comment): Promise<void> {
    await Promise.all([
      this.pub.publish('comment', {commentUpdated: comment}),
      this.postObserver.notify(comment.post),
    ])
  }

  protected async resolveById(_id: ObjectId): Promise<Comment | null> {
    return this.commentRepository.findOne({_id})
  }
}
