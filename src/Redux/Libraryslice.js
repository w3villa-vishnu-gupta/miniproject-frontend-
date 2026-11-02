import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedLibraryId: null,
  students: [],
  books: [],
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setSelectedLibraryId: (state, action) => {
      state.selectedLibraryId = action.payload;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
    },
    setBooks: (state, action) => {
      state.books = action.payload;
    },
  },
});

export const { setSelectedLibraryId, setStudents, setBooks } = librarySlice.actions;
export default librarySlice.reducer;            