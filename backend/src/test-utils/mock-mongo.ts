/** Lightweight in-memory Mongo collection/db fakes for unit tests — no real DB needed. */
import { ObjectId } from 'mongodb';

export function makeMockCursor(rows: any[]) {
  const cursor: any = {
    sort: () => cursor,
    limit: () => cursor,
    toArray: async () => rows,
  };
  return cursor;
}

export function makeMockCollection(initialDocs: any[] = []) {
  let docs = [...initialDocs];
  return {
    _docs: () => docs,
    findOne: jest.fn(async (filter: any) => docs.find((d) => matches(d, filter)) ?? null),
    find: jest.fn((filter: any = {}) => makeMockCursor(docs.filter((d) => matches(d, filter)))),
    insertOne: jest.fn(async (doc: any) => {
      const withId = { _id: doc._id ?? new ObjectId(), ...doc };
      docs.push(withId);
      return { insertedId: withId._id };
    }),
    insertMany: jest.fn(async (newDocs: any[]) => {
      const withIds = newDocs.map((d) => ({ _id: d._id ?? new ObjectId(), ...d }));
      docs.push(...withIds);
      return { insertedCount: withIds.length };
    }),
    updateOne: jest.fn(async (filter: any, update: any, options: any = {}) => {
      const idx = docs.findIndex((d) => matches(d, filter));
      if (idx === -1) {
        if (options.upsert) {
          docs.push({ _id: new ObjectId(), ...filter, ...(update.$set || {}) });
          return { matchedCount: 0, upsertedCount: 1 };
        }
        return { matchedCount: 0, upsertedCount: 0 };
      }
      if (update.$set) Object.assign(docs[idx], update.$set);
      if (update.$addToSet) {
        for (const key of Object.keys(update.$addToSet)) {
          docs[idx][key] = docs[idx][key] || [];
          docs[idx][key].push(update.$addToSet[key]);
        }
      }
      return { matchedCount: 1, upsertedCount: 0 };
    }),
    deleteOne: jest.fn(async (filter: any) => {
      const before = docs.length;
      docs = docs.filter((d) => !matches(d, filter));
      return { deletedCount: before - docs.length };
    }),
    countDocuments: jest.fn(async (filter: any = {}) => docs.filter((d) => matches(d, filter)).length),
  };
}

function idEquals(a: any, b: any): boolean {
  return a?.toString?.() === b?.toString?.();
}

function matches(doc: any, filter: any): boolean {
  return Object.entries(filter || {}).every(([key, value]) => {
    if (value && typeof value === 'object' && '$in' in value) {
      const options = (value as any).$in as any[];
      const docVal = doc[key];
      return options.some((opt) => idEquals(docVal, opt) || docVal === opt);
    }
    if (value instanceof ObjectId) {
      if (Array.isArray(doc[key])) return doc[key].some((v: any) => idEquals(v, value));
      return idEquals(doc[key], value);
    }
    if (Array.isArray(doc[key]) && value && typeof value === 'object' && 'toString' in value) {
      return doc[key].some((v: any) => idEquals(v, value));
    }
    return doc[key] === value;
  });
}

export function makeMockMongoService(seed: Record<string, any[]> = {}) {
  const collections: Record<string, ReturnType<typeof makeMockCollection>> = {};
  const db = {
    collection: (name: string) => {
      if (!collections[name]) collections[name] = makeMockCollection(seed[name] || []);
      return collections[name];
    },
  };
  return { db, _collections: collections };
}
