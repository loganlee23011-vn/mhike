import { createContext, useContext, useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  location: "",
  hikeDate: null,
  parkingAvailable: null,
  description: "",
  length: "",
  difficulty: "Moderate",
  estimatedDuration: "",
  terrainType: "Mountain",
  latitude: null,
  longitude: null,
  weather: null,
};

const HikeFormContext = createContext(null);

export function HikeFormProvider({ children }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingHikeId, setEditingHikeId] = useState(null);

  const value = useMemo(
    () => ({
      form,
      editingHikeId,
      setFields: (fields) => setForm((prev) => ({ ...prev, ...fields })),
      resetForm: () => {
        setForm(EMPTY_FORM);
        setEditingHikeId(null);
      },
      startEdit: (hike) => {
        setForm({
          name: hike.name ?? "",
          location: hike.location ?? "",
          hikeDate: hike.hikeDate ?? null,
          parkingAvailable: hike.parkingAvailable ?? null,
          description: hike.description ?? "",
          length: hike.length != null ? String(hike.length) : "",
          difficulty: hike.difficulty ?? "Moderate",
          estimatedDuration: hike.estimatedDuration ?? "",
          terrainType: hike.terrainType ?? "Mountain",
          latitude: hike.latitude ?? null,
          longitude: hike.longitude ?? null,
          weather: hike.weather ?? null,
        });
        setEditingHikeId(hike.id);
      },
    }),
    [form, editingHikeId]
  );

  return (
    <HikeFormContext.Provider value={value}>
      {children}
    </HikeFormContext.Provider>
  );
}

export function useHikeForm() {
  const ctx = useContext(HikeFormContext);
  if (!ctx) throw new Error("useHikeForm must be used within HikeFormProvider");
  return ctx;
}
