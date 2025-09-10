import { StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { mmkv } from "./mmkv";

export function mmkvPersist<T extends object>(
  config: StateCreator<T>,
  options: Omit<PersistOptions<T>, "storage">
) {
  return persist(config, {
    ...options,
    storage: {
      getItem: (name) => {
        const value = mmkv.getString(name);
        return value ? JSON.parse(value) : null;
      },
      setItem: (name, value) => {
        mmkv.set(name, JSON.stringify(value));
      },
      removeItem: (name) => {
        mmkv.delete(name);
      },
    },
  });
}
