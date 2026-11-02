import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Userslice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});