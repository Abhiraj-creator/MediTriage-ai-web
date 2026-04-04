import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Lenis from 'lenis'
import App from './App.jsx'
import './styles/globals.css'

// Initialize smooth scrolling
const lenis = new Lenis({
  duration: 3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  // easing:(t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
