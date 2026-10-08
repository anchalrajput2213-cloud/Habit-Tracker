import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";

/* =========================
   HABITS COLLECTION
========================= */

const habitsCollection = collection(db, "habits");

/* =========================
   GET HABITS
========================= */

export const getHabitsFromFirebase = async (userId) => {
  try {
    const q = query(
      habitsCollection,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    const habits = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    return habits;
  } catch (error) {
    console.log("Error getting habits:", error);
    throw error;
  }
};

/* =========================
   ADD HABIT
========================= */

export const addHabitToFirebase = async (
  userId,
  habit
) => {
  try {
    const docRef = await addDoc(
      habitsCollection,
      {
        ...habit,
        userId: userId,
        createdAt: Date.now(),
      }
    );

    return {
      id: docRef.id,
      ...habit,
      userId: userId,
    };
  } catch (error) {
    console.log("Error creating habit:", error);
    throw error;
  }
};

/* =========================
   UPDATE HABIT
========================= */

export const updateHabitInFirebase = async (
  habitId,
  updates
) => {
  try {
    const habitRef = doc(
      db,
      "habits",
      habitId
    );

    await updateDoc(
      habitRef,
      updates
    );

    console.log(
      "Habit updated successfully"
    );
  } catch (error) {
    console.log(
      "Error updating habit:",
      error
    );

    throw error;
  }
};

/* =========================
   DELETE HABIT
========================= */

export const deleteHabitFromFirebase = async (
  habitId
) => {
  try {
    const habitRef = doc(
      db,
      "habits",
      habitId
    );

    await deleteDoc(
      habitRef
    );

    console.log(
      "Habit deleted successfully"
    );
  } catch (error) {
    console.log(
      "Error deleting habit:",
      error
    );

    throw error;
  }
};