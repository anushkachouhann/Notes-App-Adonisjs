import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import votesApi, { type AgeVerificationError } from "../services/votes";
import { fetchCurrentUser } from "./authSlice";

interface VotesState {
  loading: boolean;
  error: string | null;
  ageError: AgeVerificationError | null;
  showBirthdateModal: boolean;
}

const initialState: VotesState = {
  loading: false,
  error: null,
  ageError: null,
  showBirthdateModal: false,
};

export const castVote = createAsyncThunk(
  "votes/castVote",
  async (
    { pollId, choice }: { pollId: number; choice: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await votesApi.castVote(pollId, choice);
      return response;
    } catch (error: any) {
      const data = error.response?.data;
      if (
        data?.code === "BIRTHDATE_REQUIRED" ||
        data?.code === "AGE_RESTRICTED"
      ) {
        return rejectWithValue(data as AgeVerificationError);
      }
      return rejectWithValue(data?.message || "Failed to cast vote");
    }
  }
);

export const updateBirthdate = createAsyncThunk(
  "votes/updateBirthdate",
  async (birthdate: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await votesApi.updateBirthdate(birthdate);
      // Refresh user data to get updated birthdate
      dispatch(fetchCurrentUser());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update birthdate"
      );
    }
  }
);

const votesSlice = createSlice({
  name: "votes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.ageError = null;
    },
    openBirthdateModal: (state) => {
      state.showBirthdateModal = true;
    },
    closeBirthdateModal: (state) => {
      state.showBirthdateModal = false;
      state.ageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(castVote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.ageError = null;
      })
      .addCase(castVote.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(castVote.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as AgeVerificationError | string;
        if (typeof payload === "object" && payload.code) {
          state.ageError = payload;
          if (payload.code === "BIRTHDATE_REQUIRED") {
            state.showBirthdateModal = true;
          }
        } else {
          state.error = payload as string;
        }
      })
      .addCase(updateBirthdate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBirthdate.fulfilled, (state) => {
        state.loading = false;
        state.showBirthdateModal = false;
        state.ageError = null;
      })
      .addCase(updateBirthdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, openBirthdateModal, closeBirthdateModal } =
  votesSlice.actions;
export default votesSlice.reducer;
