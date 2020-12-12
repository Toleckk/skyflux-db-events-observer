import mongodb from 'mongodb'
import {pub} from './pubsub'
import {ObservableMongoChangeStream} from './ObservableMongoChangeStream'
import {
  CommentObserver,
  EventObserver,
  LikeObserver,
  PostObserver,
  SubObserver,
  UserObserver,
} from './observers'
import {Comment, Event, Like, Post, Sub, User} from './types'

const watchDb = async () => {
  const db = await mongodb
    .connect(process.env.MONGODB_URL as string, {useUnifiedTopology: true})
    .then(c => c.db('skyflux'))

  const eventObserver = new EventObserver(pub, db.collection<Event>('events'))
  const userObserver = new UserObserver(pub, db.collection<User>('users'))
  const subObserver = new SubObserver(pub, db.collection<Sub>('subs'), userObserver)
  const postObserver = new PostObserver(pub, db.collection<Post>('posts'), userObserver)
  const likeObserver = new LikeObserver(pub, db.collection<Like>('likes'), postObserver)
  const commentObserver = new CommentObserver(pub, db.collection<Comment>('comments'), postObserver)

  new ObservableMongoChangeStream(db.watch([], {fullDocument: 'updateLookup'}))
    .subscribe(userObserver)
    .subscribe(eventObserver)
    .subscribe(subObserver)
    .subscribe(likeObserver)
    .subscribe(postObserver)
    .subscribe(commentObserver)
}

const launch: () => Promise<void> = () =>
  watchDb()
    .then(() => console.log('Started'))
    .catch(() => launch())

launch().catch(console.error)
