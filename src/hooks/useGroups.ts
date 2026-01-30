import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Group, GroupType } from "../types";

export const useGroups = (userId: string | null, userEmail: string | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    Promise.resolve().then(() => setLoading(true));

    const q = query(
      collection(db, "groups"),
      where("userId", "==", userId),
      where("deleted", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            type: data.type,
            userId: data.userId,
            createdBy: data.createdBy,
            deleted: data.deleted || false,
            deletedAt: data.deletedAt instanceof Timestamp
              ? data.deletedAt.toDate()
              : undefined,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : new Date(),
          } as Group;
        });
        
        groupsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        setGroups(groupsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      Promise.resolve().then(() => {
        setGroups([]);
        setLoading(false);
      });
    };
  }, [userId]);

  const addGroup = async (title: string, type: GroupType): Promise<string> => {
    if (!userId || !userEmail) throw new Error("User not authenticated");

    try {
      setError(null);
      const docRef = await addDoc(collection(db, "groups"), {
        title,
        type,
        userId,
        createdBy: userEmail,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err: unknown) {
      console.error('❌ Error creating group:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error creating group");
      }
      throw err;
    }
  };

  const updateGroup = async (id: string, title: string): Promise<void> => {
    try {
      setError(null);
      const groupRef = doc(db, "groups", id);
      await updateDoc(groupRef, {
        title,
        updatedAt: serverTimestamp(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error updating group");
      }
      throw err;
    }
  };

  const deleteGroup = async (id: string): Promise<void> => {
    try {
      setError(null);
      const groupRef = doc(db, "groups", id);
      await updateDoc(groupRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error deleting group");
      }
      throw err;
    }
  };

  const restoreGroup = async (id: string): Promise<void> => {
    try {
      setError(null);
      const groupRef = doc(db, "groups", id);
      await updateDoc(groupRef, {
        deleted: false,
        deletedAt: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error restoring group");
      }
      throw err;
    }
  };

  return { 
    groups, 
    loading, 
    error, 
    addGroup, 
    updateGroup, 
    deleteGroup,
    restoreGroup 
  };
};
