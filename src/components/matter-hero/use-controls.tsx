import { createContext, Dispatch, useContext, useReducer } from 'react'

interface ControlsState {
  blockCount: number
  x: number
  y: number
}

type ControlsAction =
  | { type: 'SET_BLOCK_COUNT'; payload: number }
  | { type: 'SET_X'; payload: number }
  | { type: 'SET_Y'; payload: number }

const initialState: ControlsState = {
  blockCount: 35,
  x: 0,
  y: 0.25,
}

function controlsReducer(
  state: ControlsState,
  action: ControlsAction
): ControlsState {
  switch (action.type) {
    case 'SET_BLOCK_COUNT':
      return { ...state, blockCount: action.payload }
    case 'SET_X':
      return { ...state, x: action.payload }
    case 'SET_Y':
      return { ...state, y: action.payload }
    default:
      return state
  }
}

const ControlsContext = createContext<
  | {
      state: ControlsState
      dispatch: Dispatch<ControlsAction>
    }
  | undefined
>(undefined)

export function ControlsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(controlsReducer, initialState)
  return (
    <ControlsContext.Provider value={{ state, dispatch }}>
      {children}
    </ControlsContext.Provider>
  )
}

export function useControls() {
  const context = useContext(ControlsContext)
  if (context === undefined) {
    throw new Error('useControls must be used within a ControlsProvider')
  }
  return context
}
