import { create } from 'zustand';

// 1. Описываем, какие вообще бывают настройки и их типы данных
export interface EditorSettings {
  penColor: string;
  paperType: string;
  sloppiness: number;
}

// 2. Описываем интерфейс самого хранилища
interface EditorState {
  settings: EditorSettings;
  // Эта хитрая запись означает: "ключ должен быть одним из EditorSettings, 
  // а значение должно строго соответствовать типу этого ключа"
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
}

// 3. Создаем хранилище, добавляя тип <EditorState>
export const useEditorStore = create<EditorState>((set) => ({
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
}));