import React, { useEffect, useRef } from 'react'

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    // Convert from clip space [-1, 1] to UV space [0, 1]
    vUv = position * 0.5 + 0.5;
    // Flip Y axis
    vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision highp float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    
    // Convert UVs to account for aspect ratio when calculating distance
    vec2 aspectUv = uv * aspect;
    vec2 aspectMouse = u_mouse * aspect;
    
    float dist = distance(aspectUv, aspectMouse);
    float radius = 0.25;
    
    // Liquid ripple distortion based on mouse
    if (dist < radius) {
      float intensity = pow(1.0 - (dist / radius), 2.0);
      uv.x += sin(u_time * 5.0 + uv.y * 20.0) * 0.01 * intensity;
      uv.y += cos(u_time * 5.0 + uv.x * 20.0) * 0.01 * intensity;
      
      // Pull towards mouse slightly
      uv += (u_mouse - uv) * 0.05 * intensity;
    }

    vec4 color = texture2D(u_image, uv);
    
    // Create a duotone blue effect inline for the architecture
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Deep blue background and white/light-blue highlights
    vec3 darkBlue = vec3(0.04, 0.1, 0.6);
    vec3 lightBlue = vec3(0.8, 0.9, 1.0);
    vec3 accentOrange = vec3(0.9, 0.4, 0.1); // Warm contrast color
    
    // Base duotone gradient based on grayscale luminance
    vec3 finalColor = mix(darkBlue, lightBlue, gray * 1.5);
    
    // Add warm contrast in mid-tones
    float midToneMask = smoothstep(0.4, 0.7, gray) * smoothstep(1.0, 0.6, gray);
    finalColor = mix(finalColor, accentOrange, midToneMask * 0.4);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

 function WebGLRippleImage({ imageUrl }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')

    if (!gl) {
      console.warn('WebGL not supported')
      return
    }

    // Compile shader helper
    const compileShader = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Full screen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    const uImageLoc = gl.getUniformLocation(program, 'u_image')
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const uTimeLoc = gl.getUniformLocation(program, 'u_time')

    // Load Texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    
    // Placeholder while loading
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))
    
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageUrl
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      
      // Set wrapping and filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    const resize = () => {
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }

    let animationId
    const startTime = performance.now()

    const render = () => {
      resize()
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Smooth mouse interpolation (spring effect)
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.1
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.1

      gl.useProgram(program)
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height)
      gl.uniform2f(uMouseLoc, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(uTimeLoc, (performance.now() - startTime) / 1000)
      
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(uImageLoc, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      animationId = requestAnimationFrame(render)
    }

    render()

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      // Normalize mouse to 0-1 range
      targetMouseRef.current.x = (e.clientX - rect.left) / rect.width
      targetMouseRef.current.y = (e.clientY - rect.top) / rect.height
    }

    const handleMouseLeave = () => {
      // Move mouse away to stop ripple
      targetMouseRef.current.x = -1.0
      targetMouseRef.current.y = -1.0
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
      gl.deleteProgram(program)
    }
  }, [imageUrl])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block absolute inset-0 z-0" 
      style={{ touchAction: 'none' }}
    />
  )
}

export default WebGLRippleImage;