export const pulseHighRiskCard = (element) => {
  if (!element || !window.gsap) return

  const gsap = window.gsap
  gsap.fromTo(element, 
    { boxShadow: '0 0 0px rgba(220, 38, 38, 0)' },
    { 
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)', 
      duration: 1.5, 
      repeat: -1, 
      yoyo: true, 
      ease: 'sine.inOut' 
    }
  )
}

export const flashScreenEdge = () => {
  if (!window.gsap) return

  const gsap = window.gsap
  
  // Create an overlay element
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.boxShadow = 'inset 0 0 50px rgba(220, 38, 38, 0)'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '9999'
  document.body.appendChild(overlay)

  gsap.to(overlay, {
    boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.8)',
    duration: 0.2,
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      document.body.removeChild(overlay)
    }
  })
}
