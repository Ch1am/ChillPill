'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function SplashScreen() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 500);
    const timer2 = setTimeout(() => setShowTagline(true), 1500);
    const timer3 = setTimeout(() => setShowButtons(true), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className={styles.splashContainer}>
      {/* Animated background particles */}
      <div className={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Corner decorations */}
      <div className={`${styles.cornerDecor} ${styles.topLeft}`}>
        <div className={styles.cornerLine}></div>
        <div className={styles.cornerLine}></div>
      </div>
      <div className={`${styles.cornerDecor} ${styles.topRight}`}>
        <div className={styles.cornerLine}></div>
        <div className={styles.cornerLine}></div>
      </div>
      <div className={`${styles.cornerDecor} ${styles.bottomLeft}`}>
        <div className={styles.cornerLine}></div>
        <div className={styles.cornerLine}></div>
      </div>
      <div className={`${styles.cornerDecor} ${styles.bottomRight}`}>
        <div className={styles.cornerLine}></div>
        <div className={styles.cornerLine}></div>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        {/* Logo and Title */}
        <div className={`${styles.logoContainer} ${showContent ? styles.visible : ''}`}>
          <div className={styles.pillIcon}>
            <div className={styles.pillLeft}></div>
            <div className={styles.pillRight}></div>
            <div className={styles.snowflake}>❄</div>
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleChill}>CHILL</span>
            <span className={styles.titlePill}>PILL</span>
          </h1>
          
          <div className={styles.subtitle}>SMART COOLING COORDINATION</div>
        </div>

        {/* Tagline */}
        <div className={`${styles.taglineContainer} ${showTagline ? styles.visible : ''}`}>
          <p className={styles.tagline}>
            Turning cooling from an <span className={styles.highlight}>individual decision</span> 
            <br />into a <span className={styles.highlightGreen}>collective, intelligent system</span>
          </p>
          
          <div className={styles.statsBanner}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🏢</span>
              <span className={styles.statLabel}>HDB BLOCKS</span>
            </div>
            <div className={styles.statDivider}>×</div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🏠</span>
              <span className={styles.statLabel}>RESIDENTS</span>
            </div>
            <div className={styles.statDivider}>=</div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🌡️</span>
              <span className={styles.statLabel}>COOLER SG</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`${styles.ctaContainer} ${showButtons ? styles.visible : ''}`}>
          <button 
            className={`${styles.ctaButton} ${styles.primaryBtn}`}
            onClick={() => router.push('/login')}
          >
            <span className={styles.btnText}>GET STARTED</span>
            <span className={styles.btnArrow}>▶</span>
          </button>
          
          <div className={styles.rolePreview}>
            <span className={styles.roleTag}>HDB REPRESENTATIVE</span>
            <span className={styles.roleDivider}>|</span>
            <span className={styles.roleTag}>RESIDENT</span>
          </div>
        </div>

        {/* Features preview */}
        <div className={`${styles.featuresRow} ${showButtons ? styles.visible : ''}`}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🤖</span>
            <span className={styles.featureLabel}>AI AGENTS</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔄</span>
            <span className={styles.featureLabel}>NEGOTIATION</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📊</span>
            <span className={styles.featureLabel}>REAL-TIME</span>
          </div>
        </div>
      </main>


      {/* Scanlines overlay */}
      <div className={styles.scanlines}></div>
    </div>
  );
}
