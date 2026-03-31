import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export const CustomCursor = () => {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current

    let mouseX = 0, mouseY = 0
    let ballX = 0, ballY = 0
    let followerX = 0, followerY = 0

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    document.addEventListener('mousemove', onMouseMove)

    gsap.ticker.add(() => {
      // Smooth lagging effect for cursor
      ballX += (mouseX - ballX) * 0.15
      ballY += (mouseY - ballY) * 0.15
      gsap.set(cursor, { x: ballX - 10, y: ballY - 10 })

      // Slower lagging effect for follower
      followerX += (mouseX - followerX) * 0.1
      followerY += (mouseY - followerY) * 0.1
      gsap.set(follower, { x: followerX - 20, y: followerY - 20 })
    })

    // Hover effects logic for interactive elements
    const addHoverEffect = () => {
      gsap.to(cursor, { scale: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)', duration: 0.3 })
      gsap.to(follower, { scale: 0, duration: 0.3 })
    }
    
    const removeHoverEffect = () => {
      gsap.to(cursor, { scale: 1, backgroundColor: 'var(--color-primary)', duration: 0.3 })
      gsap.to(follower, { scale: 1, duration: 0.3 })
    }

    // Attach listeners to all interactables using event delegation
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, input, textarea, select, .cursor-pointer')) {
        addHoverEffect()
      }
    }
    
    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, input, textarea, select, .cursor-pointer')) {
        removeHoverEffect()
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      gsap.ticker.remove()
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} id="custom-cursor"></div>
      <div ref={followerRef} id="cursor-follower"></div>
    </>
  )
}
