export const dataReducer = (state, action) => {
  switch(action.type) {
    case "SEARCH_DATA": {
      return Array.isArray(action.payload) ? action.payload : [];
    }
    case "LOAD_DATA": {
      const data = Array.isArray(action.payload) ? action.payload : [];
      const newData = [];

      data.forEach((dataItem) => {
        const dataIndex = state.findIndex(
          (item) => item.id === dataItem.id
        );
        if (dataIndex !== -1) {
          state[dataIndex] = dataItem;
        } else {
          newData.push(dataItem);
        }
      });

      return [...state, ...newData];
    }
    case "UPDATE_DATA": {
      const data = action.payload;
      const dataIndex = state.findIndex(
        (item) => item.id === data.id
      );

      if (dataIndex !== -1) {
        state[dataIndex] = data;
        if (action.sort) {
          state.sort((a, b) => {
            if (a[action.sort] < b[action.sort]) return 1;
            return -1;
          });
        }
        return [...state];
      } else {
        const newState = [data, ...state];
        if (action.sort) {
          newState.sort((a, b) => {
            if (a[action.sort] < b[action.sort]) return 1;
            return -1;
          });
        }
        return newState;
      }
    }
    case "DELETE_DATA": {
      const dataId = action.payload;

      const dataIndex = state.findIndex(
        (item) => item.id === dataId
      );
      if (dataIndex !== -1) {
        state.splice(dataIndex, 1);
      }
      return [...state];
    };
    case "RESET_DATA":
      return [];
    default:
      return state;
  }
};
