import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { findOne, find, insertOne, updateOne, deleteOne } from '../model/db';

// Mock MongoDB Client
jest.mock('mongodb', () => {
  const mockCollection = {
    findOne: jest.fn(),
    find: jest.fn().mockReturnValue({
      toArray: jest.fn(),
    }),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockClient = {
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn().mockReturnValue(mockDb),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.requireActual('mongodb').ObjectId,
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    MONGODB_URI: 'mongodb://localhost:27017/test',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Database Functions Tests', () => {
  let mockClient: any;
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get mock instances
    const MongoClientMock = MongoClient as jest.MockedClass<typeof MongoClient>;
    mockClient = new MongoClientMock('mongodb://localhost:27017/test');
    mockDb = mockClient.db();
    mockCollection = mockDb.collection();
  });

  describe('findOne', () => {
    it('sollte ein einzelnes Dokument finden', async () => {
      const expectedResult = { _id: 'test-id', name: 'Test Document' };
      mockCollection.findOne.mockResolvedValue(expectedResult);

      const result = await findOne('testCollection', { name: 'Test Document' });

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ name: 'Test Document' });
      expect(mockClient.close).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('sollte null zurückgeben wenn kein Dokument gefunden wird', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await findOne('testCollection', { name: 'Nonexistent' });

      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('sollte mehrere Dokumente finden', async () => {
      const expectedResults = [
        { _id: 'test-id-1', name: 'Test Document 1' },
        { _id: 'test-id-2', name: 'Test Document 2' },
      ];
      mockCollection.find().toArray.mockResolvedValue(expectedResults);

      const result = await find('testCollection', { type: 'test' });

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.find).toHaveBeenCalledWith({ type: 'test' });
      expect(mockCollection.find().toArray).toHaveBeenCalled();
      expect(mockClient.close).toHaveBeenCalled();
      expect(result).toEqual(expectedResults);
    });

    it('sollte leeres Array zurückgeben wenn keine Dokumente gefunden werden', async () => {
      mockCollection.find().toArray.mockResolvedValue([]);

      const result = await find('testCollection', { type: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('insertOne', () => {
    it('sollte ein Dokument erfolgreich einfügen', async () => {
      const insertResult = {
        insertedId: 'new-id',
        acknowledged: true,
      };
      mockCollection.insertOne.mockResolvedValue(insertResult);

      const document = { name: 'New Document', type: 'test' };
      const result = await insertOne('testCollection', document);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(document);
      expect(mockClient.close).toHaveBeenCalled();
      expect(result).toEqual(insertResult);
    });
  });

  describe('updateOne', () => {
    it('sollte ein Dokument erfolgreich aktualisieren', async () => {
      const updateResult = {
        matchedCount: 1,
        modifiedCount: 1,
        acknowledged: true,
      };
      mockCollection.updateOne.mockResolvedValue(updateResult);

      const filter = { _id: new ObjectId() };
      const update = { name: 'Updated Document' };
      const result = await updateOne('testCollection', filter, update);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(filter, { $set: update });
      expect(mockClient.close).toHaveBeenCalled();
      expect(result).toEqual(updateResult);
    });
  });

  describe('deleteOne', () => {
    it('sollte ein Dokument erfolgreich löschen', async () => {
      const deleteResult = {
        deletedCount: 1,
        acknowledged: true,
      };
      mockCollection.deleteOne.mockResolvedValue(deleteResult);

      const filter = { _id: new ObjectId() };
      const result = await deleteOne('testCollection', filter);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith(filter);
      expect(mockClient.close).toHaveBeenCalled();
      expect(result).toEqual(deleteResult);
    });
  });

  describe('Error Handling', () => {
    it('sollte Verbindung schließen auch wenn ein Fehler auftritt', async () => {
      const error = new Error('Database connection failed');
      mockCollection.findOne.mockRejectedValue(error);

      await expect(findOne('testCollection', {})).rejects.toThrow('Database connection failed');
      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
