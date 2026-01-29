'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './hdb.module.css';

// Mock data for prototype
const mockUnits = [
  { id: '12-345', status: 'optimal', temp: 24, savings: 15, negotiating: false },
  { id: '12-346', status: 'negotiating', temp: 22, savings: 8, negotiating: true },
  { id: '12-347', status: 'high', temp: 20, savings: -5, negotiating: false },
  { id: '12-348', status: 'optimal', temp: 25, savings: 20, negotiating: false },
  { id: '13-345', status: 'offline', temp: null, savings: 0, negotiating: false },
  { id: '13-346', status: 'optimal', temp: 24, savings: 12, negotiating: false },
  { id: '13-347', status: 'negotiating', temp: 21, savings: 5, negotiating: true },
  { id: '13-348', status: 'optimal', temp: 26, savings: 25, negotiating: false },
];

const mockNegotiations = [
  { id: 1, unit: '12-346', request: 'Lower to 21°C during peak hours', status: 'pending', priority: 'medium' },
  { id: 2, unit: '13-347', request: 'Extended cooling until 11PM', status: 'pending', priority: 'low' },
  { id: 3, unit: '12-347', request: 'Override block recommendation', status: 'review', priority: 'high' },
];

export default function HDBDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'negotiations' | 'analytics'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'green';
      case 'negotiating': return 'yellow';
      case 'high': return 'pink';
      case 'offline': return 'gray';
      default: return 'cyan';
    }
  };

  return (
    <div className={styles.container}>
      {/* Background */}
      <div className={styles.bgGrid}></div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoChill}>CHILL</span>
            <span className={styles.logoPill}>PILL</span>
          </div>
          <div className={styles.headerDivider}></div>
          <div className={styles.headerInfo}>
            <span className={styles.headerLabel}>BLOCK AGENT</span>
            <span className={styles.blockId}>BLK-123A TANJONG PAGAR</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.weatherWidget}>
            <span className={styles.weatherIcon}>🌡️</span>
            <span className={styles.weatherTemp}>32°C</span>
            <span className={styles.weatherLabel}>OUTDOOR</span>
          </div>
          <div className={styles.timeWidget}>
            <span className={styles.timeIcon}>⏰</span>
            <span className={styles.timeValue}>14:32</span>
            <span className={styles.timeLabel}>PEAK HOURS</span>
          </div>
          <button className={styles.logoutBtn} onClick={() => router.push('/login')}>
            LOGOUT
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        {['overview', 'units', 'negotiations', 'analytics'].map((tab) => (
          <button
            key={tab}
            className={`${styles.navBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Stats Cards */}
            <div className={styles.statsRow}>
              <div className={`${styles.statCard} ${styles.cyan}`}>
                <div className={styles.statIcon}>🏠</div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>248</span>
                  <span className={styles.statLabel}>TOTAL UNITS</span>
                </div>
                <div className={styles.statTrend}>+3 NEW</div>
              </div>
              
              <div className={`${styles.statCard} ${styles.green}`}>
                <div className={styles.statIcon}>✓</div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>89%</span>
                  <span className={styles.statLabel}>COMPLIANCE RATE</span>
                </div>
                <div className={styles.statTrend}>↑ 5%</div>
              </div>
              
              <div className={`${styles.statCard} ${styles.yellow}`}>
                <div className={styles.statIcon}>🔄</div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>12</span>
                  <span className={styles.statLabel}>ACTIVE NEGOTIATIONS</span>
                </div>
                <div className={styles.statTrend}>3 PENDING</div>
              </div>
              
              <div className={`${styles.statCard} ${styles.pink}`}>
                <div className={styles.statIcon}>⚡</div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>-18%</span>
                  <span className={styles.statLabel}>ENERGY VS BASELINE</span>
                </div>
                <div className={styles.statTrend}>SAVING</div>
              </div>
            </div>

            {/* Block Heat Map */}
            <div className={styles.heatMapSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>🗺️ BLOCK HEAT MAP</h2>
                <div className={styles.legend}>
                  <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.cool}`}></span>COOL</span>
                  <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.warm}`}></span>WARM</span>
                  <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.hot}`}></span>HOT</span>
                </div>
              </div>
              <div className={styles.heatMapGrid}>
                {[...Array(40)].map((_, i) => (
                  <div 
                    key={i} 
                    className={styles.heatCell}
                    style={{
                      backgroundColor: ['#39ff14', '#39ff14', '#ffff00', '#39ff14', '#ff2d95'][Math.floor(Math.random() * 5)],
                      opacity: 0.3 + Math.random() * 0.5
                    }}
                  >
                    <span className={styles.cellLabel}>{Math.floor(i / 10) + 10}-{(i % 10) + 340}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className={styles.aiSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>🤖 BLOCK AGENT RECOMMENDATIONS</h2>
                <span className={styles.aiStatus}>● ACTIVE</span>
              </div>
              <div className={styles.aiRecommendations}>
                <div className={styles.aiCard}>
                  <div className={styles.aiPriority} style={{ background: 'var(--neon-pink)' }}>HIGH</div>
                  <p className={styles.aiText}>
                    Units on floors 12-15 showing <strong>collective heat buildup</strong>. 
                    Suggest staggering cooling schedules by 15 minutes.
                  </p>
                  <div className={styles.aiActions}>
                    <button className={styles.aiBtn}>APPLY</button>
                    <button className={styles.aiBtnSecondary}>REVIEW</button>
                  </div>
                </div>
                <div className={styles.aiCard}>
                  <div className={styles.aiPriority} style={{ background: 'var(--neon-yellow)' }}>MEDIUM</div>
                  <p className={styles.aiText}>
                    Peak demand expected at 15:00-17:00. <strong>Pre-cooling window</strong> available 
                    for 45 units.
                  </p>
                  <div className={styles.aiActions}>
                    <button className={styles.aiBtn}>NOTIFY ALL</button>
                    <button className={styles.aiBtnSecondary}>DETAILS</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className={styles.unitsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🏠 UNIT STATUS</h2>
              <div className={styles.filterRow}>
                <select className={styles.filterSelect}>
                  <option>ALL UNITS</option>
                  <option>OPTIMAL</option>
                  <option>NEGOTIATING</option>
                  <option>HIGH USAGE</option>
                </select>
                <input className={styles.searchInput} placeholder="Search unit..." />
              </div>
            </div>
            <div className={styles.unitsGrid}>
              {mockUnits.map((unit) => (
                <div key={unit.id} className={`${styles.unitCard} ${styles[unit.status]}`}>
                  <div className={styles.unitHeader}>
                    <span className={styles.unitId}>#{unit.id}</span>
                    <span className={`${styles.unitStatus} ${styles[getStatusColor(unit.status)]}`}>
                      {unit.status.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.unitStats}>
                    <div className={styles.unitStat}>
                      <span className={styles.unitStatLabel}>TEMP</span>
                      <span className={styles.unitStatValue}>{unit.temp ? `${unit.temp}°C` : '--'}</span>
                    </div>
                    <div className={styles.unitStat}>
                      <span className={styles.unitStatLabel}>SAVINGS</span>
                      <span className={`${styles.unitStatValue} ${unit.savings >= 0 ? styles.positive : styles.negative}`}>
                        {unit.savings >= 0 ? '+' : ''}{unit.savings}%
                      </span>
                    </div>
                  </div>
                  {unit.negotiating && (
                    <div className={styles.negotiatingBadge}>
                      🔄 NEGOTIATING
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'negotiations' && (
          <div className={styles.negotiationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🔄 NEGOTIATION QUEUE</h2>
              <span className={styles.pendingCount}>3 PENDING</span>
            </div>
            <div className={styles.negotiationsList}>
              {mockNegotiations.map((neg) => (
                <div key={neg.id} className={styles.negotiationCard}>
                  <div className={styles.negHeader}>
                    <span className={styles.negUnit}>UNIT #{neg.unit}</span>
                    <span className={`${styles.negPriority} ${styles[neg.priority]}`}>
                      {neg.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className={styles.negRequest}>{neg.request}</p>
                  <div className={styles.negActions}>
                    <button className={`${styles.negBtn} ${styles.approve}`}>✓ APPROVE</button>
                    <button className={`${styles.negBtn} ${styles.counter}`}>↩ COUNTER</button>
                    <button className={`${styles.negBtn} ${styles.deny}`}>✕ DENY</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.analyticsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📊 BLOCK ANALYTICS</h2>
            </div>
            <div className={styles.analyticsGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>ENERGY CONSUMPTION (24H)</h3>
                <div className={styles.barChart}>
                  {[65, 45, 30, 25, 35, 55, 70, 85, 80, 75, 60, 50].map((val, i) => (
                    <div key={i} className={styles.barWrapper}>
                      <div 
                        className={styles.bar} 
                        style={{ height: `${val}%`, background: val > 70 ? 'var(--neon-pink)' : 'var(--neon-cyan)' }}
                      ></div>
                      <span className={styles.barLabel}>{i * 2}:00</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.metricsCard}>
                <h3 className={styles.chartTitle}>KEY METRICS</h3>
                <div className={styles.metricsList}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Avg Block Temperature</span>
                    <span className={styles.metricValue}>24.5°C</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Heat Discharge Index</span>
                    <span className={styles.metricValue}>0.72</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Coordination Score</span>
                    <span className={styles.metricValue}>87/100</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Monthly Savings</span>
                    <span className={styles.metricValue}>$12,450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Scanlines */}
      <div className={styles.scanlines}></div>
    </div>
  );
}
