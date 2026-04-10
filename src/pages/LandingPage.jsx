import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Elastic, gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import WebGLRippleImage from '../components/ui/WebGLRippleImage'

import { Logo } from '../components/common/Logo'
import { useAuth } from '../features/auth/hooks/useAuth.js'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export const LandingPage = () => {
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  const [isScrolledPastBlue, setIsScrolledPastBlue] = useState(false)
  const page2TextRef = useRef(null)
  
  // Hover Image State & Ref
  const hoverImageRef = useRef(null)
  const [activeHoverImg, setActiveHoverImg] = useState("")
  const [activeAccordion, setActiveAccordion] = useState(null)

  const footerLogoRef = useRef(null)
  const pipelineCardsRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const blueSections = document.querySelectorAll('.blue-section')
      let isOverBlue = false
      
      blueSections.forEach(sec => {
        const rect = sec.getBoundingClientRect()
        // If the navbar (top 20px roughly) is within the bounds of a blue section
        if (rect.top <= 50 && rect.bottom >= 50) {
          isOverBlue = true
        }
      })
      setIsScrolledPastBlue(!isOverBlue)
    }
    window.addEventListener('scroll', handleScroll)
    // Run once on load
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
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
      gsap.utils.toArray('.reveal').forEach((elem) => {
        gsap.fromTo(elem, 
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            scrollTrigger: {
              trigger: elem,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })

      // Page 2 text reveal animation (Inspiration style)
      if (page2TextRef.current) {
        // Split text into spans for per-letter animation
        const text = page2TextRef.current.innerText
        page2TextRef.current.innerHTML = ''
        text.split('').forEach(char => {
          const span = document.createElement('span')
          span.innerText = char
          span.style.color = 'rgba(218, 218, 218, 0.4)' // Initial gray color
          page2TextRef.current.appendChild(span)
        })

        gsap.to(page2TextRef.current.children, {
          scrollTrigger: {
            trigger: page2TextRef.current.children,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 0.5,
          },
          stagger: 0.2,
          color: "#fff"
        })
      }

      // Service items staggered
      gsap.from(".service-item", {
        scrollTrigger: {
          trigger: "#capabilities",
          start: "top 75%"
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
        ease: "power2.out",
        clearProps: "transform"
      })

      // MatchMedia for responsive Pipeline logic
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1025px)", () => {
        // Desktop - Pin side title
        ScrollTrigger.create({
          trigger: ".left-pin-container",
          start: "top top+=150", 
          endTrigger: "#pipeline",
          end: "bottom bottom", 
          pin: true,
          pinSpacing: false,
        });
      });

      mm.add("(max-width: 1024px)", () => {
        if (pipelineCardsRef.current) {
          const cards = pipelineCardsRef.current;
          gsap.to(cards, {
            x: () => -(cards.scrollWidth - window.innerWidth + 40),
            ease: "none",
            scrollTrigger: {
              trigger: "#pipeline-mobile-pin-wrapper",
              pin: true,
              scrub: 1,
              start: "top 15%", 
              end: () => `+=${cards.scrollWidth}`,
              invalidateOnRefresh: true,
            }
          });
        }
      });

      // Awwwards Style Cursor Follower for Capabilities
      if (hoverImageRef.current) {
        gsap.set(hoverImageRef.current, { xPercent: -50, yPercent: -50 });
        let xTo = gsap.quickTo(hoverImageRef.current, "x", {duration: 0.4, ease: "power3"}),
            yTo = gsap.quickTo(hoverImageRef.current, "y", {duration: 0.4, ease: "power3"});

        window.addEventListener("mousemove", e => {
          xTo(e.clientX);
          yTo(e.clientY);
        });
      }

      // Magic Sliding Background for the News Grid
      const highlighter = document.getElementById("magic-highlighter");
      const hoverCards = gsap.utils.toArray('.blog-card-hoverable');
      const hoverContainer = document.getElementById("blog-grid-container");

      if (hoverContainer && highlighter) {
        hoverCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            const rect = card.getBoundingClientRect();
            const containerRect = hoverContainer.getBoundingClientRect();
            
            gsap.to(highlighter, {
               x: rect.left - containerRect.left,
               y: rect.top - containerRect.top,
               width: rect.width,
               height: rect.height,
               opacity: 1,
               duration: 0.4,
               ease: "power3.out"
            });
            
            // Text color invert
            gsap.to(card.querySelectorAll('.animate-text'), { color: "#ffffff", duration: 0.2 });
          });
          
          card.addEventListener('mouseleave', () => {
             // Reset to primary color #0a3cce
            gsap.to(card.querySelectorAll('.animate-text'), { color: "#0a3cce", duration: 0.2 });
          });
        });

        hoverContainer.addEventListener('mouseleave', () => {
           gsap.to(highlighter, { opacity: 0, duration: 0.4, ease: "power3.out" });
        });
      }

      // Single Footer Logo Scroll Spin Animation 
      if (footerLogoRef.current) {
        gsap.fromTo(footerLogoRef.current, 
          { 
            rotation: 0
          },
          {
            rotation: 360,
            ease: 'none',
            scrollTrigger: {
              trigger: "#contact", 
              start: "top bottom", 
              end: "bottom bottom", 
              scrub: 1 
            }
          }
        );
      }

    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  const scrollToSection = (e, id) => {
    e.preventDefault()
    gsap.to(window, { 
      duration: 1.2, 
      scrollTo: { y: id, offsetY: 50 }, 
      ease: "power4.inOut" 
    })
  }

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
        
        /* Mobile Menu Animation */
        .mobile-menu-enter { transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .mobile-menu-enter-active { transform: translateY(0); }
        
        /* Pipeline Mobile Fix */
        .pipeline-cards-flex { display: flex; flex-direction: column; }
        @media (max-width: 1024px) {
            .pipeline-cards-flex { 
              flex-direction: row !important; 
              gap: 2rem !important; 
              width: max-content !important; 
              padding-right: 2rem;
            }
            .pipeline-card { flex-shrink: 0; width: 85vw; }
        }
      `}</style>

      {/* 1. Unified TopNavBar */}
      <nav className={`fixed top-0 left-0 w-full h-[12vh] px-6 md:px-12 flex items-center justify-between z-[100] pointer-events-auto transition-all duration-300 ${isScrolledPastBlue || isMobileMenuOpen ? 'bg-[#0a3cce]/90 backdrop-blur-md shadow-md text-white border-b border-white/10' : 'bg-transparent text-white'}`}>
        {/* Left: Logo */}
        <div className="flex items-center">
          <Logo className={`w-10 h-10 md:w-12 md:h-12 transition-all duration-300 ${isScrolledPastBlue ? 'filter-none opacity-100' : 'filter opacity-90'}`} pathClassName="fill-white" />
        </div>
        {/* Center: Links */}
        <div className="hidden lg:flex gap-12 items-center">
           <a className="insp-font-a text-base md:text-lg hover-underline-animation" href="#pipeline" onClick={(e) => scrollToSection(e, "#pipeline")}>PIPELINE</a>
           <a className="insp-font-a text-base md:text-lg hover-underline-animation" href="#capabilities" onClick={(e) => scrollToSection(e, "#capabilities")}>CAPABILITIES</a>
           <a className="insp-font-a text-base md:text-lg hover-underline-animation" href="#contact" onClick={(e) => scrollToSection(e, "#contact")}>SYSTEM CONTACT</a>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className={`hidden sm:flex items-center gap-2 insp-font-a text-sm md:text-lg border px-4 md:px-6 py-2 rounded-full transition-colors duration-300 bg-white text-[#0a3cce] hover:bg-white/90 border-white font-semibold`}
            >
              → DASHBOARD
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden lg:block insp-font-a text-base md:text-lg hover-underline-animation font-light">SYSTEM LOGIN</Link>
              <Link to="/get-started" className={`flex items-center gap-2 insp-font-a text-sm md:text-lg border px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isScrolledPastBlue || isMobileMenuOpen ? 'border-white text-white hover:bg-white hover:text-[#0a3cce]' : 'border-white text-white hover:bg-white hover:text-[#0b48ed]'}`}>
                {isAuthenticated ? 'OPEN APP' : 'INITIALIZE'}
                <i className="ri-arrow-right-line"></i>
              </Link>
            </>
          )}
          
          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white transition-transform active:scale-90"
          >
            <i className={`ri-${isMobileMenuOpen ? 'close-line' : 'menu-4-line'} text-3xl`}></i>
          </button>
        </div>

        {/* Mobile Flyout Menu */}
        <div className={`absolute top-[12vh] left-0 w-full bg-[#0a3cce] border-b border-white/10 px-8 py-10 flex flex-col gap-8 transition-all duration-500 transform lg:hidden ${isMobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-10 opacity-0 invisible pointer-events-none'}`}>
           <a className="insp-font-a text-3xl text-white font-light tracking-tight" href="#pipeline" onClick={(e) => { setIsMobileMenuOpen(false); scrollToSection(e, "#pipeline"); }}>// PIPELINE</a>
           <a className="insp-font-a text-3xl text-white font-light tracking-tight" href="#capabilities" onClick={(e) => { setIsMobileMenuOpen(false); scrollToSection(e, "#capabilities"); }}>// CAPABILITIES</a>
           <a className="insp-font-a text-3xl text-white font-light tracking-tight" href="#contact" onClick={(e) => { setIsMobileMenuOpen(false); scrollToSection(e, "#contact"); }}>// SYSTEM CONTACT</a>
           
           {!isAuthenticated && (
             <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="insp-font-a text-3xl text-white font-light tracking-tight">// SYSTEM LOGIN</Link>
           )}

           <div className="mt-8 pt-8 border-t border-white/20">
              <p className="font-mono-technical text-[10px] opacity-50 tracking-[0.2em] mb-4 uppercase">System Status: Active</p>
              <p className="font-mono-technical text-[10px] opacity-30">©2026 MEDITRIAGE CORE INC.</p>
           </div>
        </div>
      </nav>

      {/* Injecting Remix Icons and Fonts for Inspiration Hero */}
      <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@100;300;400;500&display=swap');
        .insp-font-a { font-family: 'Jost', sans-serif; font-weight: 350; }
        .insp-font-c { font-family: 'Jost', sans-serif; font-weight: 300; }
        
        .hover-underline-animation {
          display: inline-block;
          position: relative;
        }
        .hover-underline-animation::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: currentColor;
          transform-origin: bottom right;
          transition: transform 0.3s ease-out;
        }
        .hover-underline-animation:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        
        .service-hover-translate { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .service-item:hover .service-hover-translate { transform: translateX(20px); }
        .service-item:hover .service-hover-icon { transform: rotate(45deg); }
        
        .floating-hover-img {
            pointer-events: none;
            position: fixed;
            top: 0; left: 0;
            width: 320px; height: 400px;
            z-index: 100;
            opacity: 0;
            transform: scale(0.5);
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        }
        .floating-hover-img.active {
            opacity: 1;
            transform: scale(1);
        }
      `}</style>

      {/* 2. Hero Section - EXACT Inspiration Implementation */}
      <section 
        id="page1"
        className="relative h-[100svh] w-screen overflow-hidden bg-[#0a3cce] blue-section"
      >
        <video 
          src="https://thisismagma.com/wp-content/themes/magma/assets/home/hero/1.mp4?2" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover object-[60%_50%] md:object-center"
        />
        
        <div className="absolute bottom-[12%] md:bottom-[10%] left-[8%] md:left-[10%] z-10 w-[84%] md:w-auto">
            <h1 className="hero-title text-4xl xs:text-5xl sm:text-6xl md:text-[6vw] lg:text-[5vw] text-white insp-font-a leading-[1.1] md:leading-[1.1] lg:leading-[80px] m-0 p-0 font-light drop-shadow-lg">
               Expedite Clinical <br /> Intake Decisions
            </h1>
            <div className="flex flex-col lg:flex-row gap-4 md:gap-[30px] mt-6 md:mt-[40px] lg:items-center">
                <h4 className="hero-sub text-sm xs:text-base sm:text-lg lg:text-[19px] text-white/90 insp-font-c leading-relaxed md:leading-[1.4] lg:leading-[30px] m-0 p-0 font-light max-w-xl">
                    Deploy real-time AI scoring for emergency workflows <br className="hidden lg:block" />
                    and orchestrate patient data securely.
                </h4>
                <Link to={isAuthenticated ? '/dashboard' : '/get-started'} className="mt-4 lg:mt-0 flex items-center justify-center rounded-[50px] text-black bg-white border-none insp-font-a font-medium h-[48px] xs:h-[54px] md:h-[60px] px-8 text-sm xs:text-base md:text-lg cursor-pointer hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl w-fit">
                  {isAuthenticated ? '→ DASHBOARD' : 'ACCESS SYSTEM'}
                </Link>
            </div>
        </div>
      </section>

      <div 
        id="page2" 
        className="h-[100svh] w-screen relative bg-[#0a3cce] blue-section flex flex-col items-center justify-center gap-[40px] px-6"
      >
          <h2 className="insp-font-a text-[rgba(255,255,255,0.648)] font-[100] w-[85%] md:w-[70%] text-sm md:text-2xl text-center">
             ARCHITECTS OF CLINICAL PRECISION
          </h2>
          <h1 
            ref={page2TextRef}
            className="insp-font-a w-[85%] md:w-[70%] leading-[1.2] md:leading-[1.3] text-[6vw] md:text-[4.5vw] font-[100] m-0 p-0 text-center whitespace-pre-wrap"
          >
             We navigate the complexity of patient data to ensure every diagnosis is instant. Our AI integrates directly with your workflow for strategic triage insights.
          </h1>
      </div>

      {/* 4. "Here at every step" / The Pipeline */}
      <section id="pipeline" className="bg-surface-container py-20 md:py-32 px-4 md:px-6 relative">
        <div className="grid-blueprint max-w-screen-2xl mx-auto">
            <div className="col-span-3 md:col-span-1 vertical-divider md:pr-8 left-pin-container relative">
                <div className="md:block">
                    <h2 className="text-4xl xs:text-5xl md:text-7xl font-black leading-[0.9] uppercase reveal">
                        Here<br/>at every<br/>step
                    </h2>
                    <div className="mt-4 md:mt-12 reveal">
                        <div className="wavy-line opacity-30 mb-4 md:mb-8"></div>
                        <p className="font-mono-technical text-xs md:text-sm">PHASE 01 — PHASE 04</p>
                    </div>
                </div>
            </div>
            
            <div className="col-span-3 md:col-span-2 md:pl-12 py-8 md:py-12 space-y-16 lg:space-y-16 relative z-10 overflow-visible lg:overflow-visible">
                <div id="pipeline-mobile-pin-wrapper" className="w-full overflow-visible pt-[15vh] lg:pt-0">
                    <div 
                      ref={pipelineCardsRef}
                      className="pipeline-cards-flex h-auto lg:h-auto"
                    >
                {/* Step 1 */}
                <div className="flex justify-start pipeline-card reveal z-[1] relative shrink-0 w-[85vw] lg:w-full">
                    <div className="tilt-1 bg-surface border border-primary p-6 md:p-8 w-full lg:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">01</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Initial Data Intake</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Comprehensive NLP processing of raw patient symptom descriptions before physical assessment.</p>
                    </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex justify-end pipeline-card reveal z-[2] relative shrink-0 w-[85vw] lg:w-full">
                    <div className="tilt-2 bg-primary text-on-primary border border-primary p-6 md:p-8 w-full lg:max-w-[80%] shadow-[-4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-surface pb-2">02</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Algorithmic Scoring</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Developing a tactical risk stratification matrix (ESI 1-5), ensuring zero friction with existing EMRs.</p>
                    </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex justify-start pipeline-card reveal z-[3] relative shrink-0 w-[85vw] lg:w-full">
                    <div className="tilt-3 bg-surface border border-primary p-6 md:p-8 w-full lg:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">03</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Realtime Websockets</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Direct asynchronous push to the physician command center layout. Zero refreshing required.</p>
                    </div>
                </div>
                
                {/* Step 4 */}
                <div className="flex justify-end pipeline-card reveal z-[4] relative shrink-0 w-[85vw] lg:w-full pr-8">
                    <div className="tilt-1 bg-surface border border-primary p-6 md:p-8 w-full lg:max-w-[80%] shadow-[4px_4px_0px_#1A1AFF] transition-transform hover:rotate-0">
                        <span className="font-mono-technical text-3xl md:text-4xl block mb-4 border-b border-primary pb-2">04</span>
                        <h4 className="text-lg md:text-xl font-bold mb-2 uppercase">Physician Override</h4>
                        <p className="text-sm opacity-80 font-mono-technical">Securing the final human-in-the-loop sign off and routing the patient to the correct trauma bay.</p>
                    </div>
                </div>
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
            
            <div className="col-span-3 md:col-span-2 flex flex-col justify-center py-8 md:py-24 md:pl-12 services-container relative">
                <div className="space-y-0 border-t border-primary relative z-10">
                    {[
                      { num: "01/05", title: "NLP Triage Processing", img: "https://images.unsplash.com/photo-1620712948343-0008eccfc75c?auto=format&fit=crop&w=600&q=80", desc: "Our models process unstructured patient intakes instantly, extracting critical symptom data without manual entry. Precision-engineered for high-velocity triage workflows." },
                      { num: "02/05", title: "Realtime Synchronization", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", desc: "Leveraging cutting-edge websockets to sync patient states across the entire hospital network seamlessly. No latency, zero lag, fully synchronized clinical command." },
                      { num: "03/05", title: "Confidence Intervals", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", desc: "Every diagnosis comes with a dynamically calculated safety threshold, allowing doctors to interpret model certainty and mitigate high-risk outcomes confidently." },
                      { num: "04/05", title: "Brutalist UI Engine", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", desc: "Zero visual clutter. The interface presents only the most vital information, ensuring that clinicians aren't overwhelmed by bloated UI paradigms." },
                      { num: "05/05", title: "Clinical Sign-off Logs", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80", desc: "All automated actions are securely queued for a final human-in-the-loop validation, providing legally compliant audit trails for modern enterprise healthcare." }
                    ].map((feature, idx) => {
                        const isActive = activeAccordion === idx;
                        return (
                        <div key={idx} className="border-b border-primary bg-surface transition-colors duration-300 group">
                          {/* Header Row */}
                          <div 
                            onMouseEnter={() => { if(window.innerWidth > 1024) setActiveHoverImg(feature.img); }}
                            onMouseLeave={() => { if(window.innerWidth > 1024) setActiveHoverImg(""); }}
                            onClick={() => setActiveAccordion(isActive ? null : idx)}
                            className={`py-6 md:py-8 flex justify-between items-center px-2 md:px-6 service-item cursor-pointer transition-all duration-500 ${isActive ? 'bg-primary text-on-primary' : 'hover:bg-primary hover:text-on-primary'}`}
                          >
                              <div className="flex items-center gap-6 md:gap-12 service-hover-translate">
                                  <span className="font-mono-technical text-[10px] md:text-xs">
                                    {feature.num}
                                  </span>
                                  <h3 className="text-lg md:text-3xl font-bold uppercase transition-colors">
                                    {feature.title}
                                  </h3>
                              </div>
                              <span className="text-xl md:text-3xl font-light transform transition-transform duration-300" style={{ transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                                  +
                              </span>
                          </div>
                          
                          {/* Expanded Content */}
                          <div 
                            className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                            style={{ maxHeight: isActive ? '1200px' : '0px', opacity: isActive ? 1 : 0 }}
                          >
                            <div className="p-6 md:p-12 flex flex-col md:flex-row gap-8 bg-surface-container border-t border-primary">
                               <div className="w-full md:w-1/2 h-[300px] md:h-[400px] border border-primary overflow-hidden relative">
                                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover duotone-blue hover:filter-none transition-all duration-700 hover:scale-105" />
                               </div>
                               <div className="w-full md:w-1/2 flex flex-col justify-center">
                                  <h4 className="text-2xl font-black mb-4 uppercase">{feature.title}</h4>
                                  <p className="font-mono-technical text-sm md:text-base opacity-80 leading-relaxed max-w-xl">
                                    {feature.desc}
                                  </p>
                                  <div className="mt-8">
                                     <button onClick={() => setActiveAccordion(null)} className="border border-primary px-6 py-2 font-mono-technical text-xs hover:bg-primary hover:text-on-primary transition-colors">
                                        CLOSE DETAILS
                                     </button>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
            </div>
            
            {/* The Floating Image Follower */}
            <div 
               ref={hoverImageRef} 
               className={`floating-hover-img border border-primary bg-primary ${activeHoverImg && !activeAccordion ? 'active' : ''}`}
            >
               {activeHoverImg && (
                 <img src={activeHoverImg} alt="Feature visual" className="w-full h-full object-cover duotone-blue scale-110 group-hover:scale-100 transition-transform duration-700" />
               )}
            </div>
        </div>
      </section>

      {/* 6. High-Contrast News / Analytics Block */}
      <section className="bg-surface-container py-20 md:py-32 border-t border-primary border-b">
        <div className="grid-blueprint px-4 md:px-6 max-w-screen-2xl mx-auto blog-container">
            <div className="col-span-3 md:col-span-1 md:pr-12 reveal mb-8 md:mb-0 h-full">
                <div className="h-full border border-primary overflow-hidden min-h-[300px] md:min-h-[600px] bg-primary relative group">
                    <WebGLRippleImage 
                        imageUrl="https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-on-primary text-center pointer-events-none z-10 bg-primary/20 group-hover:bg-transparent transition-colors duration-500">
                       <p className="font-mono-technical text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">45 MINUTE REDUCTION IN DOOR-TO-DOC LATENCY.</p>
                    </div>
                </div>
            </div>
            <div id="blog-grid-container" className="col-span-3 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px bg-primary border border-primary reveal relative z-0">
                {/* Magic sliding highlighter - absolute pos, beneath text but above card base */}
                <div id="magic-highlighter" className="absolute top-0 left-0 bg-primary z-0 pointer-events-none opacity-0"></div>

                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between blog-card min-h-[200px] blog-card-hoverable cursor-pointer">
                    <div className="relative z-10 pointer-events-none">
                        <span className="font-mono-technical text-[10px] block mb-4 animate-text">SYSTEM STAT / REGULATION</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4 animate-text">Fully compliant with standard HIPAA pipelines</h4>
                    </div>
                    <svg className="w-6 h-6 self-end animate-text relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between blog-card min-h-[200px] blog-card-hoverable cursor-pointer">
                    <div className="relative z-10 pointer-events-none">
                        <span className="font-mono-technical text-[10px] block mb-4 animate-text">SYSTEM STAT / TECH</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4 animate-text">Zustand & Supabase Realtime Architecture</h4>
                    </div>
                    <svg className="w-6 h-6 self-end animate-text relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                <div className="bg-surface-container p-6 md:p-8 flex flex-col justify-between blog-card min-h-[200px] blog-card-hoverable cursor-pointer">
                    <div className="relative z-10 pointer-events-none">
                        <span className="font-mono-technical text-[10px] block mb-4 animate-text">SYSTEM STAT / SAFETY</span>
                        <h4 className="text-xl md:text-2xl font-bold uppercase mb-4 animate-text">Automated ESI Scoring built for high accuracy</h4>
                    </div>
                    <svg className="w-6 h-6 self-end animate-text relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                
                {/* CTA Card  */}
                <Link to="/get-started" className="bg-surface-container p-6 md:p-8 flex flex-col justify-center items-center group blog-card min-h-[200px] blog-card-hoverable cursor-pointer">
                    <h4 className="text-lg md:text-xl font-bold uppercase mb-2 animate-text relative z-10 pointer-events-none">Deploy The Blueprint</h4>
                    <svg className="w-10 h-10 group-hover:translate-x-2 transition-transform animate-text relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
            </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer id="contact" className="bg-primary text-surface-container min-h-[600px] md:min-h-[716px] relative flex md:items-center py-20 px-4 md:px-6 section-reveal border-t border-primary overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 w-full max-w-screen-2xl mx-auto relative z-10 reveal">
            
            {/* Left Box (Copyright & Single Logo) */}
            <div className="md:col-span-4 lg:col-span-5 flex flex-col justify-end pt-12 md:pt-0">
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/get-started"}
                  className="w-16 h-16 md:w-24 md:h-24 mb-8 flex items-center justify-start group"
                >
                   <div ref={footerLogoRef} className="w-full h-full origin-center">
                     <Logo className="w-full h-full opacity-90 transition-opacity group-hover:opacity-100" pathClassName="fill-white" />
                   </div>
                </Link>
                <div className="mb-4">
                    <h5 className="font-mono-technical text-xs">MEDITRIAGE CORE INC.</h5>
                </div>
                <div className="font-mono-technical text-[10px] opacity-40">
                    ©2026 MEDITRIAGE AI. ALL RIGHTS RESERVED.
                </div>
            </div>
            
            {/* Right Layout (Links) - Compact safely away from logo */}
            <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-16 md:pl-12">
                
                {/* Column: SYSTEM MANUAL */}
                <div className="flex flex-col justify-between">
                    <div>
                        <h5 className="font-mono-technical text-xs mb-8 opacity-70">SYSTEM MANUAL</h5>
                        <ul className="space-y-4 font-mono-technical text-xs">
                            <li><a className="hover:underline hover:opacity-100 transition-opacity" href="#">Triage Timelines</a></li>
                            <li><a className="hover:underline hover:opacity-100 transition-opacity" href="#">Websocket Architecture</a></li>
                            <li><a className="hover:underline hover:opacity-100 transition-opacity" href="#">Algorithmic Metrics</a></li>
                            <li><a className="hover:underline hover:opacity-100 transition-opacity" href="#">Corporate Integration</a></li>
                        </ul>
                    </div>
                    <div className="mt-12 md:mt-24">
                        <h5 className="font-mono-technical text-xs mb-4 opacity-70">LEGAL ENCLAVE</h5>
                        <div className="flex gap-4 font-mono-technical text-[10px]">
                            <a className="hover:underline" href="#">HIPAA COMPLIANCE</a>
                            <a className="hover:underline" href="#">TERMS OF SERVICE</a>
                        </div>
                    </div>
                </div>
                
                {/* Column: CONTACT US */}
                <div className="flex flex-col justify-between">
                    <div className="mb-12 md:mb-0">
                        <h5 className="font-mono-technical text-xs mb-8 opacity-70">CONTACT US</h5>
                        <p className="text-xl md:text-2xl font-bold mb-4">375 Patient Flow St,<br/>Level 4 Database<br/>San Francisco, CA</p>
                        <p className="font-mono-technical text-sm mb-8 md:mb-12">T: +1 800 555 0199</p>
                        
                        <div className="border-b border-white/30 pb-2 mb-4 flex items-center justify-between group">
                            <input className="bg-transparent border-none p-0 font-mono-technical text-xs w-full focus:ring-0 outline-none placeholder:text-white/40 text-on-primary" placeholder="JOIN THE TRIAGE MAILING LIST" type="email" />
                            <button className="group-hover:translate-x-1 transition-transform">
                                <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <a className="font-mono-technical text-[10px] md:text-xs border border-white/30 px-4 py-2 hover:bg-white hover:text-primary transition-colors" href="#">LINKEDIN</a>
                        <a className="font-mono-technical text-[10px] md:text-xs border border-white/30 px-4 py-2 hover:bg-white hover:text-primary transition-colors" href="#">GITHUB</a>
                    </div>
                </div>

            </div>
        </div>
      </footer>
    </div>
  )
}
