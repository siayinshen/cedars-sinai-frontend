import {
  LOADING_UI,
  LOADING_FOLDER_SEARCH,
  STOP_LOADING_UI,
  STOP_LOADING_FOLDER_SEARCH,
  SET_ERRORS,
  CLEAR_ERRORS,
} from "../types";

const initialState = {
  loading: false,
  loadingFolderSearch: false,
  errors: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    // errors
    case SET_ERRORS:
      console.log(action.payload);
      return {
        ...state,
        errors: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        errors: {},
        loading: false,
      };
    // loading
    case LOADING_UI:
      return {
        ...state,
        errors: {},
        loading: true,
      };
    case STOP_LOADING_UI:
      return {
        ...state,
        errors: {},
        loading: false,
      };
    case LOADING_FOLDER_SEARCH:
      return {
        ...state,
        errors: [],
        loadingFolderSearch: true,
      };
    case STOP_LOADING_FOLDER_SEARCH:
      return {
        ...state,
        errors: [],
        loadingFolderSearch: false,
      };
    default:
      return state;
  }
}
