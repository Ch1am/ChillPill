'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

type UserRole = 'hdb' | 'resident' | null;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For prototype, just navigate to appropriate dashboard
    if (selectedRole === 'hdb') {
      router.push('/dashboard/hdb');
    } else {
      router.push('/dashboard/resident');
    }
  };

  return (
    <div className={styles.container}>
      {/* Background effects */}
      <div className={styles.bgGrid}></div>
      <div className={styles.glowOrb1}></div>
      <div className={styles.glowOrb2}></div>

      {/* Back button */}
      <button className={styles.backBtn} onClick={() => router.push('/')}>
        <span>◀</span> BACK
      </button>

      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoSmall}>
            <span className={styles.logoChill}>CHILL</span>
            <span className={styles.logoPill}>PILL</span>
          </div>
          <h1 className={styles.title}>LOGIN DETAILS</h1>
          <p className={styles.subtitle}>Select how you interact with the system</p>
        </div>

        {/* Role Selection */}
        <div className={styles.roleSelection}>
          {/* HDB Representative Card */}
          <button 
            className={`${styles.roleCard} ${selectedRole === 'hdb' ? styles.selected : ''}`}
            onClick={() => setSelectedRole('hdb')}
          >
            <div className={styles.roleIcon}>🏢</div>
            <h2 className={styles.roleTitle}>HDB REPRESENTATIVE</h2>
            <p className={styles.roleDescription}>
              Block-level management and coordination
            </p>
            
            <div className={styles.roleFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Monitor all units in your block</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>View aggregate energy consumption</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Review negotiation requests</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Set block-wide policies</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Heat map visualization</span>
              </div>
            </div>

            <div className={styles.roleTag}>BLOCK AGENT ACCESS</div>
            {selectedRole === 'hdb' && <div className={styles.selectedIndicator}>✓ SELECTED</div>}
          </button>

          {/* Resident Card */}
          <button 
            className={`${styles.roleCard} ${styles.residentCard} ${selectedRole === 'resident' ? styles.selected : ''}`}
            onClick={() => setSelectedRole('resident')}
          >
            <div className={styles.roleIcon}>🏠</div>
            <h2 className={styles.roleTitle}>RESIDENT</h2>
            <p className={styles.roleDescription}>
              Personal cooling preferences and scheduling
            </p>
            
            <div className={styles.roleFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Set your comfort preferences</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>View AI-optimized schedules</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Participate in negotiations</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Track energy savings</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>▸</span>
                <span>Earn sustainability rewards</span>
              </div>
            </div>

            <div className={styles.roleTag}>RESIDENT AGENT ACCESS</div>
            {selectedRole === 'resident' && <div className={styles.selectedIndicator}>✓ SELECTED</div>}
          </button>
        </div>

        {/* Login Form */}
        {selectedRole && (
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <div className={styles.formHeader}>
              <span className={styles.formIcon}>{selectedRole === 'hdb' ? '🏢' : '🏠'}</span>
              <span className={styles.formTitle}>
                {selectedRole === 'hdb' ? 'HDB REPRESENTATIVE' : 'RESIDENT'} LOGIN
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                {selectedRole === 'hdb' ? 'EMPLOYEE ID / EMAIL' : 'UNIT NUMBER / EMAIL'}
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder={selectedRole === 'hdb' ? 'e.g., HDB-12345 or email' : 'e.g., #12-345 or email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>PASSWORD</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {selectedRole === 'hdb' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>BLOCK CODE</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., BLK-123A"
                />
              </div>
            )}

            {selectedRole === 'resident' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>HOUSEHOLD SIZE</label>
                <select className={styles.input}>
                  <option value="">Select household size</option>
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5+ people</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className={`${styles.submitBtn} ${selectedRole === 'hdb' ? styles.hdbBtn : styles.residentBtn}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingText}>CONNECTING...</span>
              ) : (
                <>
                  <span>ACCESS DASHBOARD</span>
                  <span className={styles.btnArrow}>▶</span>
                </>
              )}
            </button>

            <div className={styles.formFooter}>
              <a href="#" className={styles.footerLink}>Forgot Password?</a>
              <span className={styles.footerDivider}>|</span>
              <a href="#" className={styles.footerLink}>Register New Account</a>
            </div>
          </form>
        )}

      </main>

      {/* Scanlines */}
      <div className={styles.scanlines}></div>
    </div>
  );
}
