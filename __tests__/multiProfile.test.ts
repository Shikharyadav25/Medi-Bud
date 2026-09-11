import {
  fetchProfilesByAccount,
  persistLocalProfile,
  deleteLocalProfile,
  fetchProfileById,
} from "@/db/repositories/profileRepository";
import { UserProfile } from "@/lib/types";

// Mock DB client
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/db/client", () => ({
  getDatabase: () => mockDb,
  enqueueOutbox: jest.fn(),
}));

describe("Multi-Profile Repository & Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches all profiles belonging to a specific account", () => {
    const mockRows = [
      {
        id: 1,
        uid: "prof_1",
        accountId: "account_abc",
        name: "Rohan",
        relationship: "self",
        age: 32,
        gender: "Male",
        heightCm: 175,
        weightKg: 74,
        healthIssues: "Asthma",
        medications: "Inhaler",
        allergies: "Dust",
        updatedAt: 1700000000000,
        syncStatus: "synced",
      },
      {
        id: 2,
        uid: "prof_2",
        accountId: "account_abc",
        name: "Maa",
        relationship: "parent",
        age: 62,
        gender: "Female",
        heightCm: 158,
        weightKg: 65,
        healthIssues: "Hypertension, Type 2 Diabetes",
        medications: "Amlodipine, Metformin",
        allergies: "None",
        updatedAt: 1700000001000,
        syncStatus: "pending",
      },
    ];

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          all: jest.fn().mockReturnValue(mockRows),
        }),
      }),
    });

    const result = fetchProfilesByAccount("account_abc");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Rohan");
    expect(result[0].relationship).toBe("self");
    expect(result[1].name).toBe("Maa");
    expect(result[1].relationship).toBe("parent");
    expect(result[1].age).toBe(62);
  });

  test("inserts new family member profile with returning record", () => {
    const newProfile: UserProfile = {
      uid: "prof_child_1",
      accountId: "account_abc",
      name: "Aarav",
      relationship: "child",
      age: 6,
      gender: "Male",
      heightCm: 115,
      weightKg: 20,
      healthIssues: "",
      medications: "",
      allergies: "Peanuts",
      updatedAt: 1700000002000,
      syncStatus: "pending",
    };

    // No existing record
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          all: jest.fn().mockReturnValue([]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue({
          all: jest.fn().mockReturnValue([{ ...newProfile, id: 3 }]),
        }),
      }),
    });

    const saved = persistLocalProfile(newProfile);
    expect(saved.id).toBe(3);
    expect(saved.name).toBe("Aarav");
    expect(saved.relationship).toBe("child");
    expect(saved.age).toBe(6);
  });

  test("deletes family member profile by id", () => {
    mockDb.delete.mockReturnValue({
      where: jest.fn().mockReturnValue({
        run: jest.fn(),
      }),
    });

    deleteLocalProfile(2);
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
