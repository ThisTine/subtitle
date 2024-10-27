import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {ColorModeProvider} from "./components/ui/color-mode.tsx";
import {Provider} from "./components/ui/provider.tsx";
import {Toaster} from "./components/ui/toaster.tsx";
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ColorModeProvider forcedTheme={"light"}>
          <Provider>
              <Toaster/>
              <App />
          </Provider>
      </ColorModeProvider>
  </StrictMode>,
)
