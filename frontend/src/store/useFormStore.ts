import { create } from 'zustand';
import { diff } from 'deep-diff';

interface FormStore {
  currentSchema: any;
  previousSchema: any;
  messages: Array<{ role: 'user' | 'ai'; content: string }>;
  schemaDiff: any;
  formData: any;          // Added: Needed for the form logic
  updateSchema: (newSchema: any) => void;
  addMessage: (role: 'user' | 'ai', content: string) => void;
  setFormData: (data: any) => void; // Added: Needed for the form onChange
}

export const useFormStore = create<FormStore>((set, get) => ({
  currentSchema: { type: "object", properties: {}, version: 1 },
  previousSchema: null,
  messages: [{ role: 'ai', content: "Hello! Describe the form you'd like to build." }],
  schemaDiff: null,
  formData: {}, // Initialize as empty object

  updateSchema: (newSchema) => {
    const oldSchema = get().currentSchema;
    const changes = diff(oldSchema, newSchema);
    set({ 
      previousSchema: oldSchema, 
      currentSchema: newSchema,
      schemaDiff: changes 
    });
  },

  addMessage: (role, content) => 
    set((state) => ({ messages: [...state.messages, { role, content }] })),

  setFormData: (data) => set({ formData: data }), // Implementation of the setter
}));