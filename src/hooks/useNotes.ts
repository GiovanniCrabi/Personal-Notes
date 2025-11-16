import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Note } from "../types";

export const useNotes = (userId: string | null) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    Promise.resolve().then(() => setLoading(true));

    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            userId: data.userId,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : new Date(),
          } as Note;
        });
        setNotes(notesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching notes:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      Promise.resolve().then(() => {
        setNotes([]);
        setLoading(false);
      });
    };
  }, [userId]);

  const addNote = async (title: string, content: string): Promise<string> => {
    if (!userId) throw new Error("User not authenticated");

    try {
      setError(null);
      const docRef = await addDoc(collection(db, "notes"), {
        title,
        content,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao fazer login");
      }
      throw err;
    }
  };

  const updateNote = async (
    id: string,
    title: string,
    content: string
  ): Promise<void> => {
    try {
      setError(null);
      const noteRef = doc(db, "notes", id);
      await updateDoc(noteRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao fazer login");
      }
      throw err;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      setError(null);
      const noteRef = doc(db, "notes", id);
      await deleteDoc(noteRef);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao fazer login");
      }
      throw err;
    }
  };

  return { notes, loading, error, addNote, updateNote, deleteNote };
};