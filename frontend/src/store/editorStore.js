import { create } from 'zustand';

export const useEditorStore = create((set) => ({
  // Дефолтные настройки конспекта
  settings: {
    penColor: 'blue',
    paperType: 'lined',
    sloppiness: 5,
  },
  
  // Метод для обновления конкретной настройки
  updateSetting: (key, value) => 
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    })),
}));ГГде