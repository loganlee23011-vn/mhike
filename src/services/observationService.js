import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

const observationsRef = collection(db, "observations");

function toDoc(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    observedAt: data.observedAt?.toDate?.() ?? null,
  };
}

export function subscribeToObservations(hikeId, onChange, onError) {
  // Single-field where(), sorted client-side — avoids requiring a composite
  // Firestore index for hikeId + observedAt (which isn't provisioned for this project).
  const q = query(observationsRef, where("hikeId", "==", hikeId));
  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map(toDoc);
      docs.sort((a, b) => (b.observedAt?.getTime() ?? 0) - (a.observedAt?.getTime() ?? 0));
      onChange(docs);
    },
    onError
  );
}

export function subscribeToRecentObservations(count, onChange, onError) {
  const q = query(observationsRef, orderBy("observedAt", "desc"), limit(count));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toDoc)),
    onError
  );
}

export async function addObservation(userId, hikeId, observation) {
  const docRef = await addDoc(observationsRef, {
    userId,
    hikeId,
    observationText: observation.observationText,
    observedAt: Timestamp.fromDate(observation.observedAt ?? new Date()),
    comments: observation.comments ?? "",
    latitude: observation.latitude ?? null,
    longitude: observation.longitude ?? null,
    weather: observation.weather ?? null,
  });
  return docRef.id;
}

export async function updateObservation(id, changes) {
  await updateDoc(doc(db, "observations", id), {
    ...changes,
    ...(changes.observedAt ? { observedAt: Timestamp.fromDate(changes.observedAt) } : {}),
  });
}

export async function deleteObservation(id) {
  await deleteDoc(doc(db, "observations", id));
}

export async function deleteObservationsForHike(hikeId) {
  const q = query(observationsRef, where("hikeId", "==", hikeId));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}
