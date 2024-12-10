import { create } from 'zustand';

const useStore = create((set) => ({
  update_pending_page: 0,
  increment_for_pending_page: () => set((state) => ({ update_pending_page: state.update_pending_page + 1 })),
  //decrement: () => set((state) => ({ update_pending_page: state.update_pending_page - 1 })),
}));

export default useStore;
