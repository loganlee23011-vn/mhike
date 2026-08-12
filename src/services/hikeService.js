import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import { deleteObservationsForHike } from "./observationService";

const hikesRef = collection(db, "hikes");

function toDoc(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    hikeDate: data.hikeDate?.toDate?.() ?? null,
  };
}

export function subscribeToHikes(onChange, onError) {
  const q = query(hikesRef, orderBy("hikeDate", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toDoc)),
    onError
  );
}

export async function getHikeById(id) {
  const snap = await getDoc(doc(db, "hikes", id));
  return snap.exists() ? toDoc(snap) : null;
}

export async function addHike(userId, hike) {
  const docRef = await addDoc(hikesRef, {
    userId,
    name: hike.name,
    location: hike.location,
    hikeDate: Timestamp.fromDate(hike.hikeDate),
    parkingAvailable: hike.parkingAvailable,
    length: Number(hike.length),
    difficulty: hike.difficulty,
    description: hike.description ?? "",
    estimatedDuration: hike.estimatedDuration ?? "",
    terrainType: hike.terrainType ?? "",
    latitude: hike.latitude ?? null,
    longitude: hike.longitude ?? null,
    weather: hike.weather ?? null,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateHike(id, changes) {
  await updateDoc(doc(db, "hikes", id), {
    ...changes,
    ...(changes.hikeDate ? { hikeDate: Timestamp.fromDate(changes.hikeDate) } : {}),
    updatedAt: serverTimestamp(),
  });
}

// Manually toggled from DetailScreen — completion is independent of hikeDate
// (a past hike the user never did shouldn't silently read as "Completed",
// and one finished ahead of schedule should be markable right away).
export async function setHikeCompleted(id, completed) {
  await updateDoc(doc(db, "hikes", id), {
    completed,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteHike(id) {
  await deleteObservationsForHike(id);
  await deleteDoc(doc(db, "hikes", id));
}

export async function resetHikes(userId) {
  const q = query(hikesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteHike(d.id)));
}
