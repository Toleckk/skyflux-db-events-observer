import {ChangeEvent, ChangeEventCR, ChangeEventDelete, ChangeEventUpdate} from 'mongodb'
import {EventType} from './types'

export const isDeleteEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEventDelete<I> => e.operationType === 'delete'

export const isSoftDeleteEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEvent<I> & {fullDocument: {deletedAt: string}} =>
  (isUpdateEvent(e) || isReplaceEvent(e)) &&
  !!e.fullDocument &&
  'deletedAt' in e.fullDocument &&
  !!e.fullDocument.deletedAt

export const isUpdateEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEventUpdate<I> => e.operationType === 'update'

export const isReplaceEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEventCR<I> & {operationType: 'replace'} & {fullDocument: I} =>
  e.operationType === 'replace'

export const isInsertEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEventCR<I> => e.operationType === 'insert'

export const isRestoreEvent = <I extends Record<string, any>>(
  e: ChangeEvent<I>,
): e is ChangeEvent<I> & {fullDocument: {deletedAt: never}} =>
  (e.operationType === 'update' &&
    ((e.updateDescription.removedFields &&
      e.updateDescription.removedFields.includes('deletedAt')) ||
      (e.updateDescription.updatedFields &&
        'deletedAt' in e.updateDescription.updatedFields &&
        !e.updateDescription.updatedFields))) ||
  (isReplaceEvent(e) && (!('deletedAt' in e.fullDocument) || !e.fullDocument.deletedAt))

export const getEventType = (e: ChangeEvent): EventType | undefined => {
  if (!e) return
  if (isDeleteEvent(e)) return 'delete'
  if (isInsertEvent(e) || isRestoreEvent(e)) return 'insert'
  if (isSoftDeleteEvent(e)) return 'delete'
  if (isUpdateEvent(e)) return 'update'
}
