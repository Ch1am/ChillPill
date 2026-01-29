'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './resident.module.css';

// Mock schedule data
const mockSchedule = [
  { time: '06:00', temp: 26, status: 'off', label: 'Wake up' },
  { time: '08:00', temp: 28, status: 'off', label: 'Work hours' },
  { time: '12:00', temp: 25, status: 'on', label: 'Lunch break' },
  { time: '14:00', temp: 28, status: 'off', label: 'Work hours' },
  { time: '18:00', temp: 24, status: 'on', label: 'Evening' },
  { time: '22:00', temp: 25, status: 'on', label: 'Sleep' },
  { time: '00:00', temp: 26, status: 'timer', label: 'Night' },
];

const mockNegotiationHistory = [
  { id: 1, date: '2026-01-27', request: 'Extended cooling to 23:00', result: 'approved', savings: '+2%' },
  { id: 2, date: '2026-01-25', request: 'Lower temp to 21°C', result: 'counter', counterOffer: '22°C accepted', savings: '+1%' },
  { id: 3, date: '2026-01-23', request: 'Peak hour override', result: 'denied', reason: 'Block heat limit', savings: '0%' },
];

interface NegotiationMessage {
  role: string;
  content: string;
  proposal?: string;
}

interface NegotiationResult {
  negotiationId: string;
  status: string;
  rounds: number;
  finalProposal?: {
    temperature: number;
    startTime: string;
    endTime: string;
    reason: string;
  };
  messages: NegotiationMessage[];
}

export default function ResidentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'preferences' | 'rewards'>('home');
  const [currentTemp, setCurrentTemp] = useState(24);
  const [isAcOn, setIsAcOn] = useState(true);
  const [comfortLevel, setComfortLevel] = useState(75);
  
  // Negotiation state
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);

  const startNegotiation = async () => {
    setIsNegotiating(true);
    setShowNegotiationModal(true);
    setNegotiationResult(null);

    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: '12-345',
          preferredTemp: currentTemp,
          householdSize: 4,
          outdoorTemp: 32,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNegotiationResult(data.data);
      } else {
        console.error('Negotiation failed:', data.error);
      }
    } catch (error) {
      console.error('Negotiation error:', error);
    } finally {
      setIsNegotiating(false);
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
            <span className={styles.headerLabel}>RESIDENT AGENT</span>
            <span className={styles.unitId}>UNIT #12-345</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statusPill}>
            <span className={styles.statusDot}></span>
            <span>AI ACTIVE</span>
          </div>
          <button className={styles.logoutBtn} onClick={() => router.push('/login')}>
            LOGOUT
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        {['home', 'schedule', 'preferences', 'rewards'].map((tab) => (
          <button
            key={tab}
            className={`${styles.navBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab === 'home' && '🏠 '}
            {tab === 'schedule' && '📅 '}
            {tab === 'preferences' && '⚙️ '}
            {tab === 'rewards' && '🏆 '}
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === 'home' && (
          <div className={styles.homeGrid}>
            {/* AC Control Card */}
            <div className={styles.acControl}>
              <div className={styles.acHeader}>
                <h2 className={styles.acTitle}>COOLING CONTROL</h2>
                <div className={`${styles.acStatus} ${isAcOn ? styles.on : styles.off}`}>
                  {isAcOn ? '● ON' : '○ OFF'}
                </div>
              </div>

              <div className={styles.tempDisplay}>
                <button 
                  className={styles.tempBtn}
                  onClick={() => setCurrentTemp(t => Math.max(18, t - 1))}
                >
                  −
                </button>
                <div className={styles.tempValue}>
                  <span className={styles.tempNumber}>{currentTemp}</span>
                  <span className={styles.tempUnit}>°C</span>
                </div>
                <button 
                  className={styles.tempBtn}
                  onClick={() => setCurrentTemp(t => Math.min(30, t + 1))}
                >
                  +
                </button>
              </div>

              <div className={styles.acModes}>
                <button className={`${styles.modeBtn} ${styles.active}`}>❄️ COOL</button>
                <button className={styles.modeBtn}>💨 FAN</button>
                <button className={styles.modeBtn}>🤖 AUTO</button>
              </div>

              <button 
                className={`${styles.powerBtn} ${isAcOn ? styles.on : ''}`}
                onClick={() => setIsAcOn(!isAcOn)}
              >
                {isAcOn ? 'TURN OFF' : 'TURN ON'}
              </button>
            </div>

            {/* AI Suggestion Card */}
            <div className={styles.aiSuggestion}>
              <div className={styles.aiHeader}>
                <span className={styles.aiIcon}>🤖</span>
                <h3 className={styles.aiTitle}>YOUR AI AGENT</h3>
              </div>
              <div className={styles.suggestionContent}>
                <p className={styles.suggestionText}>
                  Based on your routine and current outdoor temperature of <strong>32°C</strong>, 
                  I recommend <span className={styles.highlight}>cooling to {currentTemp}°C</span>.
                  Click to negotiate with HDB Agent to discover the optimal cooling temperature and schedule.
                </p>
                <div className={styles.suggestionStats}>
                  <div className={styles.suggestionStat}>
                    <span className={styles.statIcon}>💰</span>
                    <span>Potential savings available</span>
                  </div>
                  <div className={styles.suggestionStat}>
                    <span className={styles.statIcon}>🌡️</span>
                    <span>Block coordination enabled</span>
                  </div>
                </div>
              </div>
              <div className={styles.suggestionActions}>
                <button 
                  className={styles.negotiateBtn}
                  onClick={startNegotiation}
                  disabled={isNegotiating}
                >
                  {isNegotiating ? '🔄 NEGOTIATING...' : '🤝 START NEGOTIATION'}
                </button>
              </div>
            </div>

            {/* Today's Stats */}
            <div className={styles.todayStats}>
              <h3 className={styles.statsTitle}>TODAY&apos;S PERFORMANCE</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>4.2</span>
                  <span className={styles.statLabel}>kWh USED</span>
                  <span className={styles.statTrend}>↓ 18%</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>$1.85</span>
                  <span className={styles.statLabel}>SPENT</span>
                  <span className={styles.statTrend}>↓ $0.45</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>89</span>
                  <span className={styles.statLabel}>COMFORT SCORE</span>
                  <span className={styles.statTrend}>↑ 5pts</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>A</span>
                  <span className={styles.statLabel}>SUSTAINABILITY</span>
                  <span className={styles.statTrend}>TOP 15%</span>
                </div>
              </div>
            </div>

            {/* Block Status */}
            <div className={styles.blockStatus}>
              <h3 className={styles.blockTitle}>BLOCK STATUS</h3>
              <div className={styles.blockInfo}>
                <div className={styles.blockStat}>
                  <span className={styles.blockLabel}>Block Heat Index</span>
                  <div className={styles.heatMeter}>
                    <div className={styles.heatFill} style={{ width: '65%' }}></div>
                  </div>
                  <span className={styles.heatValue}>MODERATE</span>
                </div>
                <div className={styles.blockStat}>
                  <span className={styles.blockLabel}>Your Contribution</span>
                  <span className={styles.contributionValue}>+3.2%</span>
                </div>
                <div className={styles.negotiationAlert}>
                  <span className={styles.alertIcon}>🔔</span>
                  <span>Block Agent requests 15-min cooling shift during 15:00-16:00</span>
                  <div className={styles.alertActions}>
                    <button className={styles.alertBtn}>ACCEPT</button>
                    <button className={styles.alertBtnSecondary}>NEGOTIATE</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className={styles.scheduleSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📅 COOLING SCHEDULE</h2>
              <button className={styles.editBtn}>✏️ EDIT</button>
            </div>
            
            <div className={styles.scheduleTimeline}>
              {mockSchedule.map((slot, index) => (
                <div key={index} className={`${styles.timeSlot} ${styles[slot.status]}`}>
                  <div className={styles.slotTime}>{slot.time}</div>
                  <div className={styles.slotConnector}>
                    <div className={styles.slotDot}></div>
                    {index < mockSchedule.length - 1 && <div className={styles.slotLine}></div>}
                  </div>
                  <div className={styles.slotContent}>
                    <div className={styles.slotLabel}>{slot.label}</div>
                    <div className={styles.slotTemp}>
                      {slot.status === 'off' ? 'AC OFF' : `${slot.temp}°C`}
                    </div>
                    <div className={`${styles.slotStatus} ${styles[slot.status]}`}>
                      {slot.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.scheduleOptimize}>
              <div className={styles.optimizeHeader}>
                <span className={styles.optimizeIcon}>🤖</span>
                <span className={styles.optimizeTitle}>AI OPTIMIZATION AVAILABLE</span>
              </div>
              <p className={styles.optimizeText}>
                Your AI agent found a schedule that saves <strong>23% more energy</strong> while 
                maintaining your comfort preferences.
              </p>
              <button className={styles.optimizeBtn}>VIEW OPTIMIZED SCHEDULE</button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className={styles.preferencesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>⚙️ COMFORT PREFERENCES</h2>
            </div>

            <div className={styles.preferencesGrid}>
              <div className={styles.prefCard}>
                <h3 className={styles.prefTitle}>TEMPERATURE RANGE</h3>
                <div className={styles.rangeSlider}>
                  <span className={styles.rangeLabel}>MIN: 22°C</span>
                  <input type="range" min="18" max="30" defaultValue="22" className={styles.slider} />
                  <span className={styles.rangeLabel}>MAX: 26°C</span>
                  <input type="range" min="18" max="30" defaultValue="26" className={styles.slider} />
                </div>
              </div>

              <div className={styles.prefCard}>
                <h3 className={styles.prefTitle}>COMFORT VS SAVINGS</h3>
                <div className={styles.balanceSlider}>
                  <span className={styles.balanceLabel}>🧊 COMFORT</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={comfortLevel}
                    onChange={(e) => setComfortLevel(parseInt(e.target.value))}
                    className={styles.slider} 
                  />
                  <span className={styles.balanceLabel}>💰 SAVINGS</span>
                </div>
                <div className={styles.balanceValue}>
                  Current: {comfortLevel}% Comfort / {100 - comfortLevel}% Savings
                </div>
              </div>

              <div className={styles.prefCard}>
                <h3 className={styles.prefTitle}>HOUSEHOLD INFO</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Household Size</span>
                    <select className={styles.infoSelect}>
                      <option>1 person</option>
                      <option>2 people</option>
                      <option selected>3 people</option>
                      <option>4 people</option>
                      <option>5+ people</option>
                    </select>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Typical Home Hours</span>
                    <input type="text" defaultValue="18:00 - 08:00" className={styles.infoInput} />
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>AC Units</span>
                    <select className={styles.infoSelect}>
                      <option>1 unit</option>
                      <option selected>2 units</option>
                      <option>3 units</option>
                      <option>4+ units</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.prefCard}>
                <h3 className={styles.prefTitle}>AI AGENT PERMISSIONS</h3>
                <div className={styles.toggleList}>
                  <div className={styles.toggleItem}>
                    <span>Allow auto-scheduling</span>
                    <div className={`${styles.toggle} ${styles.on}`}></div>
                  </div>
                  <div className={styles.toggleItem}>
                    <span>Participate in block negotiations</span>
                    <div className={`${styles.toggle} ${styles.on}`}></div>
                  </div>
                  <div className={styles.toggleItem}>
                    <span>Pre-cooling recommendations</span>
                    <div className={`${styles.toggle} ${styles.on}`}></div>
                  </div>
                  <div className={styles.toggleItem}>
                    <span>Override for emergencies</span>
                    <div className={styles.toggle}></div>
                  </div>
                </div>
              </div>
            </div>

            <button className={styles.saveBtn}>💾 SAVE PREFERENCES</button>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className={styles.rewardsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🏆 REWARDS & ACHIEVEMENTS</h2>
            </div>

            <div className={styles.rewardsOverview}>
              <div className={styles.pointsCard}>
                <span className={styles.pointsIcon}>⭐</span>
                <div className={styles.pointsContent}>
                  <span className={styles.pointsValue}>2,450</span>
                  <span className={styles.pointsLabel}>CHILL POINTS</span>
                </div>
                <button className={styles.redeemBtn}>REDEEM</button>
              </div>

              <div className={styles.tierCard}>
                <span className={styles.tierBadge}>🥈</span>
                <div className={styles.tierInfo}>
                  <span className={styles.tierName}>SILVER CHILLER</span>
                  <div className={styles.tierProgress}>
                    <div className={styles.tierBar}>
                      <div className={styles.tierFill} style={{ width: '65%' }}></div>
                    </div>
                    <span className={styles.tierNext}>550 pts to GOLD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.achievementsGrid}>
              <h3 className={styles.achievementsTitle}>ACHIEVEMENTS</h3>
              <div className={styles.badgeGrid}>
                <div className={`${styles.badge} ${styles.earned}`}>
                  <span className={styles.badgeIcon}>🌱</span>
                  <span className={styles.badgeName}>ECO STARTER</span>
                </div>
                <div className={`${styles.badge} ${styles.earned}`}>
                  <span className={styles.badgeIcon}>🤝</span>
                  <span className={styles.badgeName}>TEAM PLAYER</span>
                </div>
                <div className={`${styles.badge} ${styles.earned}`}>
                  <span className={styles.badgeIcon}>📉</span>
                  <span className={styles.badgeName}>ENERGY SAVER</span>
                </div>
                <div className={styles.badge}>
                  <span className={styles.badgeIcon}>🏅</span>
                  <span className={styles.badgeName}>TOP 10%</span>
                </div>
                <div className={styles.badge}>
                  <span className={styles.badgeIcon}>🌡️</span>
                  <span className={styles.badgeName}>HEAT BUSTER</span>
                </div>
                <div className={styles.badge}>
                  <span className={styles.badgeIcon}>💎</span>
                  <span className={styles.badgeName}>DIAMOND</span>
                </div>
              </div>
            </div>

            <div className={styles.historySection}>
              <h3 className={styles.historyTitle}>NEGOTIATION HISTORY</h3>
              <div className={styles.historyList}>
                {mockNegotiationHistory.map((item) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyDate}>{item.date}</div>
                    <div className={styles.historyContent}>
                      <span className={styles.historyRequest}>{item.request}</span>
                      <span className={`${styles.historyResult} ${styles[item.result]}`}>
                        {item.result.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.historySavings}>{item.savings}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Scanlines */}
      <div className={styles.scanlines}></div>

      {/* Negotiation Modal */}
      {showNegotiationModal && (
        <div className={styles.modalOverlay} onClick={() => !isNegotiating && setShowNegotiationModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isNegotiating ? '🔄 NEGOTIATING...' : '🤝 NEGOTIATION COMPLETE'}
              </h2>
              {!isNegotiating && (
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowNegotiationModal(false)}
                >
                  ✕
                </button>
              )}
            </div>

            {isNegotiating ? (
              <div className={styles.negotiatingContent}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.negotiatingText}>
                  Your AI Agent is negotiating with the Block Agent...
                </p>
                <p className={styles.negotiatingSubtext}>
                  This may take 10-30 seconds. Watch the terminal for live updates!
                </p>
              </div>
            ) : negotiationResult ? (
              <div className={styles.resultContent}>
                <div className={`${styles.resultStatus} ${styles[negotiationResult.status]}`}>
                  {negotiationResult.status === 'approved' && '✓ APPROVED'}
                  {negotiationResult.status === 'accepted' && '✓ ACCEPTED'}
                  {negotiationResult.status === 'countered' && '↩ COUNTERED'}
                  {negotiationResult.status === 'denied' && '✕ DENIED'}
                </div>

                <div className={styles.resultStats}>
                  <div className={styles.resultStat}>
                    <span className={styles.resultLabel}>Rounds</span>
                    <span className={styles.resultValue}>{negotiationResult.rounds}</span>
                  </div>
                  {negotiationResult.finalProposal && (
                    <>
                      <div className={styles.resultStat}>
                        <span className={styles.resultLabel}>Final Temp</span>
                        <span className={styles.resultValue}>{negotiationResult.finalProposal.temperature}°C</span>
                      </div>
                      <div className={styles.resultStat}>
                        <span className={styles.resultLabel}>Time</span>
                        <span className={styles.resultValue}>
                          {negotiationResult.finalProposal.startTime}-{negotiationResult.finalProposal.endTime}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.conversationLog}>
                  <h3 className={styles.logTitle}>NEGOTIATION LOG</h3>
                  <div className={styles.messages}>
                    {negotiationResult.messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`${styles.message} ${msg.role === 'resident_agent' ? styles.resident : styles.block}`}
                      >
                        <div className={styles.messageRole}>
                          {msg.role === 'resident_agent' ? '🏠 RESIDENT AGENT' : '🏢 BLOCK AGENT'}
                        </div>
                        <div className={styles.messageContent}>
                          {msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content}
                        </div>
                        {msg.proposal && (
                          <div className={styles.messageProposal}>
                            {(() => {
                              try {
                                const p = JSON.parse(msg.proposal);
                                return `Proposed: ${p.temperature}°C from ${p.startTime}-${p.endTime}`;
                              } catch {
                                return '';
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className={styles.closeModalBtn}
                  onClick={() => setShowNegotiationModal(false)}
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <div className={styles.errorContent}>
                <p>Something went wrong. Please try again.</p>
                <button 
                  className={styles.closeModalBtn}
                  onClick={() => setShowNegotiationModal(false)}
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
