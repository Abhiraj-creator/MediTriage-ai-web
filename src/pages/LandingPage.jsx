import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export const LandingPage = () => {
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero entrance
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.2
      })
      gsap.from(".hero-sub", {
        x: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.8
      })

      // Generic section reveals
      const reveals = document.querySelectorAll('.reveal')
      reveals.forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none"
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        })
      })

      // Service items staggered
      gsap.from(".service-item", {
        scrollTrigger: {
          trigger: ".services-container",
          start: "top 85%"
        },
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      })

      // Blog cards staggered
      gsap.from(".blog-card", {
        scrollTrigger: {
          trigger: ".blog-container",
          start: "top 90%"
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleMouseMove = (e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    // Calculate position relative to the hero section
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseLeave = () => {
    // Hide mask by moving it far off screen
    setMousePos({ x: -1000, y: -1000 })
  }

  // A striking abstract technical video from a public asset source
  const BgVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connections-in-a-network-31514-large.mp4"

  return (
    <div ref={containerRef} className="bg-surface text-primary min-h-screen overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* GLOBAL STYLES SPECIFIC TO LANDING PAGE (using standard Tailwind where possible, and inline style variants) */}
      <style>{`
        .font-mono-technical { font-family: 'Space Grotesk', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .halftone-overlay { position: relative; }
        .halftone-overlay::after {
            content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: radial-gradient(var(--color-primary) 0.5px, transparent 0.5px);
            background-size: 3px 3px; opacity: 0.15; pointer-events: none;
        }
        .duotone-blue { filter: grayscale(100%) contrast(120%) brightness(90%) sepia(100%) hue-rotate(190deg) saturate(300%); }
        .wavy-line {
            mask-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0 50 10 T 100 10' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
            mask-size: 50px 20px; background-color: var(--color-primary); height: 1px; width: 100%;
        }
        .tilt-1 { transform: rotate(1.2deg); }
        .tilt-2 { transform: rotate(-1.5deg); }
        .tilt-3 { transform: rotate(0.8deg); }
        
        .grid-blueprint { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .vertical-divider { border-right: 1px solid currentColor; }
        
        @media (max-width: 767px) {
            .grid-blueprint { display: flex; flex-direction: column; }
            .vertical-divider { border-right: none; border-bottom: 1px solid currentColor; padding-bottom: 2rem; margin-bottom: 2rem; }
            .tilt-1, .tilt-2, .tilt-3 { transform: rotate(0); }
        }
        .reveal { opacity: 0; transform: translateY(30px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 1. TopNavBar (Hidden in favor of floating elements in Hero for exact match) */}
      
      {/* 2. Hero Section - Extreme Refactor for Video & Shader Match */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-screen flex flex-col justify-end p-4 md:p-8 bg-primary overflow-hidden border-b border-primary cursor-crosshair"
      >
        {/* Underlay Video (What is revealed - e.g., inverted/black and white) */}
        <div className="absolute inset-0 z-0 bg-surface">
           <video src={BgVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover grayscale opacity-50 contrast-150" />
        </div>

        {/* Overlay Video (The normal view with Halftone and Blue Duotone) */}
        {/* We use a CSS Mask to cut a hole in this layer, revealing the underlay where the mouse is. */}
        <div 
           className="absolute inset-0 z-10 duotone-blue halftone-overlay pointer-events-none transition-[mask-position] duration-75"
           style={{
             maskImage: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, transparent 15%, black 40%)`,
             WebkitMaskImage: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, transparent 15%, black 40%)`
           }}
        >
           <video src={BgVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
           {/* Center architectural line */}
           <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/30 transform -translate-x-1/2 pattern-line"></div>
        </div>

        {/* Top Floating Header Elements (over everything) */}
        <div className="absolute top-8 left-8 z-50">
           <div className="border border-white text-white px-4 py-2 flex items-center gap-4 bg-primary/20 backdrop-blur-sm shadow-[4px_4px_0px_#1A1AFF]">
             <div className="w-5 h-5 border border-white rounded-full flex items-center justify-center relative">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white"></div>
                <div className="absolute h-full w-[1px] bg-white"></div>
             </div>
             <span className="font-mono-technical text-xs tracking-widest font-bold">MEDITRIAGE CORE INC.</span>
           </div>
        </div>
        
        <div className="absolute top-8 right-8 z-50 flex gap-4">
           <Link to="/login" className="w-10 h-10 border border-white rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors backdrop-blur-sm bg-primary/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
           </Link>
           <Link to="/register" className="border border-white text-white px-6 py-2 font-mono-technical text-xs tracking-widest hover:bg-white hover:text-primary transition-colors flex items-center backdrop-blur-sm bg-primary/20">
              INITIALIZE
           </Link>
        </div>

        {/* Floating Side Text */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 z-40 max-w-xs text-white hero-sub pointer-events-none">
           <p className="text-xl md:text-3xl font-medium leading-[1.1]">
              Answering all of your clinical intake needs.
           </p>
        </div>

        {/* Giant Bottom Typography */}
        <div className="relative z-40 text-white w-full pointer-events-none">
          <h1 className="text-[clamp(4rem,15vw,260px)] font-black leading-[0.8] tracking-tighter uppercase hero-title hero-word drop-shadow-lg">
             MediTriage
          </h1>
          <h1 className="text-[clamp(4rem,15vw,260px)] font-black leading-[0.8] tracking-tighter uppercase hero-title hero-word drop-shadow-lg">
             AI Core.
          </h1>
        </div>
      </section>

      {/* 3. About Section */}
      <section className="bg-primary text-on-primary py-20 md:py-32 px-4 md:px-6 border-t border-white/20">
        <div className="max-w-screen-2xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold leading-tight mb-12 md:mb-20 max-w-4xl reveal">
                WE ARE THE ARCHITECTS OF CLINICAL PRECISION, NAVIGATING THE COMPLEXITY OF PATIENT DATA TO ENSURE EVERY DIAGNOSIS IS INSTANT.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 border-t border-white/30 pt-12">
                <div className="reveal">
                    <h3 className="font-mono-technical text-xs mb-4 md:mb-6 opacity-60">OUR CORE PHILOSOPHY</h3>
                    <p className="text-base md:text-lg leading-relaxed">
                        In an era of shifting overcrowding and complex triaging protocols, MediTriage stands as the definitive bridge between raw patient input and municipal clinical deployment. We treat every intake as a technical puzzle, solving for efficiency, safety, and speed.
                    </p>
                </div>
                <div class="reveal">
                    <h3 className="font-mono-technical text-xs mb-4 md:mb-6 opacity-60">STRATEGIC PRECISION</h3>
                    <p className="text-base md:text-lg leading-relaxed">
                        Our AI integrates directly with your workflow, providing real-time websockets and actionable insights that keep your ER timeline on track. From patient routing to predictive analytics, we are your tactical advantage in the clinical environment.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. "Here at every step" / The Pipeline */}
      <section id="pipeline" className="bg-surface-container py-20 md:py-32 px-4 md:px-6 relative">
        <div className="grid-blueprint max-w-screen-2xl mx-auto">
            <div className="col-span-3 md:col-span-1 vertical-divider md:pr-8">
                <h2 className="text-5xl md:text-7xl font-black leading-[0.9] uppercase md:sticky md:top-32 reveal">
                    Here<br/>at every<br/>step
                </h2>
                <div className="mt-8 md:mt-12 reveal">
                    <div className="wavy-line opacity-30 mb-8"></div>
                    <p className="font-mono-technical text-sm">PHASE 01 — PHASE 04</p>
                </div>
            </div>
            
            <div className="col-span-3 md:col-span-2 md:pl-12 space-y-8 md:space-y-16 py-8 md:py-12 relative z-10">
                {/* Step 1 */}
                <div className="flex justify-start reveal">
                    <div className="tilt-1 bg-surface border border-primary p-6 md:p-8 w-full md:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">01</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Initial Data Intake</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Comprehensive NLP processing of raw patient symptom descriptions before physical assessment.</p>
                    </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex justify-end reveal">
                    <div className="tilt-2 bg-primary text-on-primary border border-primary p-6 md:p-8 w-full md:max-w-[80%] shadow-[-4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-surface pb-2">02</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Algorithmic Scoring</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Developing a tactical risk stratification matrix (ESI 1-5), ensuring zero friction with existing EMRs.</p>
                    </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex justify-start reveal">
                    <div className="tilt-3 bg-surface border border-primary p-6 md:p-8 w-full md:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">03</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Realtime Websockets</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Direct asynchronous push to the physician command center layout. Zero refreshing required.</p>
                    </div>
                </div>
                
                {/* Step 4 */}
                <div className="flex justify-end reveal">
                    <div className="tilt-1 bg-surface border border-primary p-6 md:p-8 w-full md:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">04</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Physician Override</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Securing the final human-in-the-loop sign off and routing the patient to the correct trauma bay.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. "Our Capabilities" */}
      <section id="capabilities" className="bg-surface border-t border-primary px-4 md:px-6 overflow-hidden">
        <div className="grid-blueprint max-w-screen-2xl mx-auto md:min-h-[819px]">
            <div className="col-span-3 md:col-span-1 vertical-divider flex flex-col justify-between py-12 md:py-24 md:pr-8 reveal">
                <h2 className="text-6xl md:text-8xl font-black leading-[0.85] uppercase mb-8 md:mb-0">System<br/>Features</h2>
                <div className="halftone-overlay w-full aspect-[4/5] border border-primary overflow-hidden hidden md:block mt-8">
                    {/* Using an abstract placeholder image to match the duotone requirement */}
                    <img alt="Abstract medical mesh" className="w-full h-full object-cover duotone-blue" src="https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"/>
                </div>
            </div>
            
            <div className="col-span-3 md:col-span-2 flex flex-col justify-center py-8 md:py-24 md:pl-12 services-container">
                <div className="space-y-0 border-t border-primary">
                    <div className="group border-b border-primary py-6 md:py-8 flex justify-between items-center bg-surface hover:bg-primary hover:text-on-primary transition-all px-2 md:px-6 service-item">
                        <span className="font-mono-technical text-[10px] md:text-xs">01/05</span>
                        <h3 className="text-lg md:text-3xl font-bold uppercase">NLP Triage Processing</h3>
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="group border-b border-primary py-6 md:py-8 flex justify-between items-center bg-surface hover:bg-primary hover:text-on-primary transition-all px-2 md:px-6 service-item">
                        <span className="font-mono-technical text-[10px] md:text-xs">02/05</span>
                        <h3 className="text-lg md:text-3xl font-bold uppercase">Realtime Synchronization</h3>
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="group border-b border-primary py-6 md:py-8 flex justify-between items-center bg-surface hover:bg-primary hover:text-on-primary transition-all px-2 md:px-6 service-item">
                        <span className="font-mono-technical text-[10px] md:text-xs">03/05</span>
                        <h3 className="text-lg md:text-3xl font-bold uppercase">Confidence Intervals</h3>
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="group border-b border-primary py-6 md:py-8 flex justify-between items-center bg-surface hover:bg-primary hover:text-on-primary transition-all px-2 md:px-6 service-item">
                        <span className="font-mono-technical text-[10px] md:text-xs">04/05</span>
                        <h3 className="text-lg md:text-3xl font-bold uppercase">Brutalist UI Engine</h3>
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="group border-b border-primary py-6 md:py-8 flex justify-between items-center bg-surface hover:bg-primary hover:text-on-primary transition-all px-2 md:px-6 service-item">
                        <span className="font-mono-technical text-[10px] md:text-xs">05/05</span>
                        <h3 className="text-lg md:text-3xl font-bold uppercase">Clinical Sign-off Logs</h3>
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 6. High-Contrast News / Analytics Block */}
      <section className="bg-surface-container py-20 md:py-32 border-t border-primary border-b">
        <div className="grid-blueprint px-4 md:px-6 max-w-screen-2xl mx-auto blog-container">
            <div className="col-span-3 md:col-span-1 md:pr-12 reveal mb-8 md:mb-0">
                <div className="halftone-overlay h-full border border-primary overflow-hidden min-h-[300px] md:min-h-[600px] bg-primary relative">
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-on-primary text-center">
                       <p className="font-mono-technical text-2xl">45 MINUTE REDUCTION IN DOOR-TO-DOC LATENCY.</p>
                    </div>
                </div>
            </div>
            <div className="col-span-3 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px bg-primary border border-primary reveal">
                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between hover:bg-surface transition-colors blog-card min-h-[200px]">
                    <div>
                        <span className="font-mono-technical text-[10px] block mb-4">SYSTEM STAT / REGULATION</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4">Fully compliant with standard HIPAA pipelines</h4>
                    </div>
                    <svg className="w-6 h-6 self-end" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between hover:bg-surface transition-colors blog-card min-h-[200px]">
                    <div>
                        <span className="font-mono-technical text-[10px] block mb-4">SYSTEM STAT / TECH</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4">Zustand & Supabase Realtime Architecture</h4>
                    </div>
                    <svg className="w-6 h-6 self-end" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between hover:bg-surface transition-colors blog-card min-h-[200px]">
                    <div>
                        <span className="font-mono-technical text-[10px] block mb-4">SYSTEM STAT / SAFETY</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4">Automated ESI Scoring built for high accuracy</h4>
                    </div>
                    <svg className="w-6 h-6 self-end" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                {/* CTA Card Blue */}
                <Link to="/register" className="bg-primary p-6 md:p-8 flex flex-col justify-center items-center text-on-primary hover:bg-primary/90 transition-colors cursor-pointer text-center group blog-card min-h-[200px]">
                    <h4 className="text-lg md:text-xl font-bold uppercase mb-2">Deploy The Blueprint</h4>
                    <svg className="w-10 h-10 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
            </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer id="contact" className="bg-primary text-surface-container min-h-[600px] md:h-[716px] relative flex items-center py-20 md:py-0 px-4 md:px-6 section-reveal border-t border-primary overflow-hidden">
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <div className="w-[500px] h-[500px] border border-white rounded-full flex items-center justify-center">
                <div className="w-full h-px bg-white absolute"></div>
                <div className="w-px h-full bg-white absolute"></div>
                <div className="w-[200px] h-[200px] border border-white rounded-full"></div>
            </div>
        </div>
        
        <div className="grid-blueprint w-full max-w-screen-2xl mx-auto relative z-10 reveal">
            <div className="col-span-3 md:col-span-1 vertical-divider border-white/20 mb-12 md:mb-0">
                <div className="mb-12 md:mb-20">
                    <h5 className="font-mono-technical text-xs mb-8">MEDITRIAGE CORE INC.</h5>
                    <div className="space-y-4">
                        <Link to="/login" className="block text-3xl md:text-4xl font-bold hover:tracking-widest transition-all uppercase">SYSTEM LOGIN</Link>
                        <Link to="/register" className="block text-3xl md:text-4xl font-bold hover:tracking-widest transition-all uppercase">SECURE CLEARANCE</Link>
                        <a href="#pipeline" className="block text-3xl md:text-4xl font-bold hover:tracking-widest transition-all uppercase">PIPELINE INFO</a>
                    </div>
                </div>
                <div className="font-mono-technical text-[10px] opacity-40">
                    ©2026 MEDITRIAGE AI. ALL RIGHTS RESERVED.
                </div>
            </div>
            
            <div className="col-span-3 md:col-span-1 vertical-divider border-white/20 md:pl-12 flex flex-col justify-between mb-12 md:mb-0">
                <div>
                    <h5 className="font-mono-technical text-xs mb-8">SYSTEM MANUAL</h5>
                    <ul className="space-y-4 font-mono-technical text-xs">
                        <li><a className="hover:underline" href="#">Triage Timelines</a></li>
                        <li><a className="hover:underline" href="#">Websocket Architecture</a></li>
                        <li><a className="hover:underline" href="#">Algorithmic Metrics</a></li>
                        <li><a className="hover:underline" href="#">Corporate Integration</a></li>
                    </ul>
                </div>
                <div className="mt-8 md:mt-0">
                    <h5 className="font-mono-technical text-xs mb-4">LEGAL ENCLAVE</h5>
                    <div className="flex gap-4 font-mono-technical text-[10px]">
                        <a className="hover:underline" href="#">HIPAA COMPLIANCE</a>
                        <a className="hover:underline" href="#">TERMS OF SERVICE</a>
                    </div>
                </div>
            </div>
            
            <div className="col-span-3 md:col-span-1 md:pl-12 flex flex-col justify-between">
                <div className="mb-12 md:mb-0">
                    <h5 className="font-mono-technical text-xs mb-8">CONTACT US</h5>
                    <p className="text-xl md:text-2xl font-bold mb-4">375 Patient Flow St,<br/>Level 4 Database<br/>San Francisco, CA</p>
                    <p className="font-mono-technical text-sm mb-8 md:mb-12">T: +1 800 555 0199</p>
                    
                    <div className="border-b border-white/30 pb-2 mb-4 flex items-center justify-between">
                        <input className="bg-transparent border-none p-0 font-mono-technical text-xs w-full focus:ring-0 outline-none placeholder:text-white/40 text-on-primary" placeholder="JOIN THE TRIAGE MAILING LIST" type="email" />
                        <button><svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
                    </div>
                </div>
                <div className="flex gap-4 md:gap-6">
                    <a className="font-mono-technical text-[10px] md:text-xs border border-white/30 px-3 py-1 hover:bg-white hover:text-primary transition-colors" href="#">LINKEDIN</a>
                    <a className="font-mono-technical text-[10px] md:text-xs border border-white/30 px-3 py-1 hover:bg-white hover:text-primary transition-colors" href="#">GITHUB</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  )
}
