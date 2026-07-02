import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import "./styles.css"

registerSW({
  immediate: false,
  onNeedRefresh() {
    window.dispatchEvent(new Event('kabala-pwa-update-available'))
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
