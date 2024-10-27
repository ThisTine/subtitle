import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {Provider} from "./components/ui/provider.tsx";
import {ColorModeProvider} from "./components/ui/color-mode.tsx";
import {Toaster} from "./components/ui/toaster.tsx";

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
