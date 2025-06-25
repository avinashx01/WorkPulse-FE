// ** Redux Imports

import { createSlice } from '@reduxjs/toolkit'

const IState: { autocompleteService: any | null; autoCompleteServiceloaded: boolean } = {
  autocompleteService: null,
  autoCompleteServiceloaded: false
}

export const globalSlice = createSlice({
  name: 'googleAddress',
  initialState: IState,
  reducers: {
    setAutoComplete: (state, action: { payload: { data: { autocompleteService: any } } }) => {
      state.autocompleteService = action.payload.data.autocompleteService
      state.autoCompleteServiceloaded = true
    }
  }
})

export const { setAutoComplete } = globalSlice.actions

export default globalSlice.reducer
