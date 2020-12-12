import {ObjectId} from 'mongodb'
import {MongoDBChangeEventObserver} from './MongoDBChangeEventObserver'
import {EntityResolver, EventType, Pub, User} from '../types'

export class UserObserver extends MongoDBChangeEventObserver<User> {
  readonly events: EventType[] = []
  readonly collection = 'users'

  constructor(private pub: Pub, private userRepository: EntityResolver<User>) {
    super()
  }

  protected async onEntityChanged(user: User): Promise<void> {
    await Promise.all([this.pub.publish('user', {userUpdated: user})])
  }

  protected resolveById(_id: ObjectId): Promise<User | null> {
    return this.userRepository.findOne({_id})
  }
}
