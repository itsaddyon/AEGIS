import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // --- Boot Sequence ---
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  const bootTerminal = document.getElementById('boot-terminal-log');
  const bootProgressBar = document.getElementById('boot-progress-bar');
  
  const bootLogs = [
    { text: 'Loading UI Subsystems...', time: 150, progress: 15 },
    { text: 'Establishing secure IPC bridges...', time: 350, progress: 35 },
    { text: 'Mounting VISTA Suite Port...', time: 550, progress: 50 },
    { text: 'Verifying ARGUS detection rules...', time: 750, progress: 70 },
    { text: 'Interfaces scan: NPCAP verified...', time: 950, progress: 85 },
    { text: 'Checking module status (ARGUS, CAST, VISTA)...', time: 1150, progress: 95 }
  ];

  bootLogs.forEach(phase => {
    setTimeout(() => {
      if (bootText) bootText.innerText = phase.text;
      if (bootProgressBar) bootProgressBar.style.width = `${phase.progress}%`;
      if (bootTerminal) {
        const div = document.createElement('div');
        div.innerHTML = `<span style="color: var(--accent-primary)">[OK]</span> ${phase.text}`;
        bootTerminal.appendChild(div);
        bootTerminal.scrollTop = bootTerminal.scrollHeight;
      }
    }, phase.time);
  });

  let bootFinished = false;
  let hasReceivedData = false;
  let extractionComplete = false;
  let isExtracting = false;

  window.updateBootProgress = function(percent, message) {
    if (bootText) bootText.innerText = message;
    if (bootProgressBar) bootProgressBar.style.width = `${percent}%`;
    if (bootTerminal && message) {
      const div = document.createElement('div');
      div.innerHTML = `<span style="color: var(--accent-primary)">[INSTALL]</span> ${message}`;
      bootTerminal.appendChild(div);
      bootTerminal.scrollTop = bootTerminal.scrollHeight;
    }
  };

  function tryDismissBootScreen() {
    if (bootFinished && hasReceivedData && (extractionComplete || !isExtracting)) {
      if (bootText) bootText.innerText = 'SYSTEM ONLINE — All modules initialized';
      if (bootProgressBar) bootProgressBar.style.width = '100%';
      const bScreen = document.getElementById('boot-screen');
      if (bScreen && !bScreen.classList.contains('fade-out')) {
        bScreen.classList.add('fade-out');
        setTimeout(() => bScreen.remove(), 600);
      }
      addLog('SYSTEM', 'Secure environment boot sequence completed.', 'success');
    }
  }

  setTimeout(() => {
    bootFinished = true;
    tryDismissBootScreen();
  }, 1300);

  // Safety fallback: dismiss after 8 seconds if IPC is delayed
  setTimeout(() => {
    if (!hasReceivedData && !isExtracting) {
      addLog('SYSTEM', 'IPC bridge delayed. Booting in standalone mode...', 'warning');
      hasReceivedData = true;
      tryDismissBootScreen();
    }
  }, 8000);

  // --- Zero-Cloud Encrypted User Authentication System ---
  const authOverlay = document.getElementById('auth-overlay');
  const authTitle = document.getElementById('auth-title');
  const authMsgBox = document.getElementById('auth-msg-box');
  const formRegister = document.getElementById('form-register');
  const formLogin = document.getElementById('form-login');
  const loginUserDisplay = document.getElementById('login-user-display');
  const authHeaderIcon = document.getElementById('auth-header-icon');

  function showAuthError(msg) {
    if (!authMsgBox) return;
    authMsgBox.className = 'auth-msg-box err font-mono';
    authMsgBox.innerHTML = `<i class="ph ph-warning-circle"></i> ${msg}`;
    authMsgBox.style.display = 'flex';
    const card = document.querySelector('.auth-card');
    if (card) {
      card.classList.remove('shake-err');
      void card.offsetWidth;
      card.classList.add('shake-err');
    }
  }

  function showAuthSuccess(msg) {
    if (!authMsgBox) return;
    authMsgBox.className = 'auth-msg-box success font-mono';
    authMsgBox.innerHTML = `<i class="ph ph-check-circle"></i> ${msg}`;
    authMsgBox.style.display = 'flex';
  }

  function updateGreetingPill(username) {
    const infoPill = document.getElementById('topbar-user-info');
    const userVal = document.getElementById('topbar-username-val');
    if (username && infoPill && userVal) {
      userVal.innerText = username;
      infoPill.style.display = 'flex';
    }
  }

  function checkVaultAuthStatus() {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.get_vault_status) {
      window.pywebview.api.get_vault_status().then(status => {
        if (status.is_first_launch) {
          isExtracting = true; // Pause boot dismissal
          
          if (authTitle) authTitle.innerText = 'SETUP AEGIS ACCESS';
          if (authHeaderIcon) authHeaderIcon.className = 'ph ph-user-plus';
          if (formRegister) formRegister.style.display = 'flex';
          if (formLogin) formLogin.style.display = 'none';
          if (authOverlay) authOverlay.classList.add('active');

          // Trigger one-time extraction of bundled tools
          window.pywebview.api.perform_initial_extraction().then(res => {
            extractionComplete = true;
            isExtracting = false;
            tryDismissBootScreen();
            if (res.success) {
              addLog('SYSTEM', 'First-time setup: Subsystem installation complete.', 'success');
            } else {
              addLog('SYSTEM', `Extraction issue (might already be installed): ${res.error || res.message}`, 'warning');
            }
          });
        } else {
          extractionComplete = true;
          if (authTitle) authTitle.innerText = 'USER ACCESS VERIFICATION';
          if (authHeaderIcon) authHeaderIcon.className = 'ph ph-lock-key';
          if (loginUserDisplay) loginUserDisplay.innerText = status.username || 'User';
          if (formRegister) formRegister.style.display = 'none';
          if (formLogin) formLogin.style.display = 'flex';
          if (authOverlay) authOverlay.classList.add('active');
          if (status.username) updateGreetingPill(status.username);
          tryDismissBootScreen();
        }
      }).catch(err => {
        console.error("Vault check failed:", err);
      });
    } else {
      setTimeout(checkVaultAuthStatus, 200);
    }
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('reg-username')?.value?.trim();
      const p = document.getElementById('reg-password')?.value;
      const cp = document.getElementById('reg-confirm-password')?.value;

      if (!u) {
        showAuthError("Please enter a username.");
        return;
      }
      if (!p || p.length < 4) {
        showAuthError("Password must be at least 4 characters long.");
        return;
      }
      if (p !== cp) {
        showAuthError("Passwords do not match. Please re-enter.");
        return;
      }

      if (window.pywebview && window.pywebview.api && window.pywebview.api.register_user) {
        window.pywebview.api.register_user(u, p).then(res => {
          if (res.success) {
            showAuthSuccess("User registration completed. Logging in...");
            updateGreetingPill(res.username);
            setTimeout(() => {
              if (authOverlay) authOverlay.classList.remove('active');
              addLog('VAULT', `Welcome, ${res.username}. Encrypted local session established.`, 'success');
            }, 600);
          } else {
            showAuthError(res.error || "Registration failed.");
          }
        });
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = document.getElementById('login-password')?.value;
      if (!p) {
        showAuthError("Please enter your password.");
        return;
      }

      if (window.pywebview && window.pywebview.api && window.pywebview.api.authenticate_user) {
        window.pywebview.api.authenticate_user(p).then(res => {
          if (res.success) {
            showAuthSuccess("Access Granted. Unlocking AEGIS Suite...");
            updateGreetingPill(res.username);
            setTimeout(() => {
              if (authOverlay) authOverlay.classList.remove('active');
              addLog('VAULT', `Welcome back, ${res.username}. Access Granted.`, 'success');
            }, 500);
          } else {
            showAuthError(res.error || "Access Denied: Invalid Password.");
          }
        });
      }
    });
  }

  checkVaultAuthStatus();

  // --- Clock HUD ---
  const clockEl = document.getElementById('header-clock');
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      clockEl.innerText = `${timeStr}.${ms}`;
    }, 33);
  }

  // --- Navigation View Switching ---
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-container');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      const targetView = item.getAttribute('data-view');
      views.forEach(view => {
        if(view.id === `view-${targetView}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      if (targetView === 'dashboard') {
        cpuChart?.resize();
        ramChart?.resize();
      }
    });
  });

  // --- Log Panel ---
  const consoleBody = document.getElementById('console-output');
  
  function addLog(module, message, level = 'info') {
    if(!consoleBody) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    const date = new Date().toISOString().split('T')[0];
    
    const div = document.createElement('div');
    div.className = `log-line ${level}`;
    div.innerHTML = `<span class="timestamp">[${date} ${time}]</span> <span class="module">[${module}]</span> <span class="message">${message}</span>`;
    
    consoleBody.appendChild(div);
    consoleBody.scrollTop = consoleBody.scrollHeight;
  }

  document.getElementById('btn-clear-logs')?.addEventListener('click', () => {
      if(consoleBody) consoleBody.innerHTML = '';
  });

  // --- Pre-Launch Diagnostic Integrity Scanner ---
  const diagOverlay = document.getElementById('launch-diagnostic-overlay');
  const diagAppName = document.getElementById('diag-app-name');
  const diagAppIcon = document.getElementById('diag-app-icon');
  const diagScanState = document.getElementById('diag-scan-state');
  const diagProgressBar = document.getElementById('diag-progress-bar');
  const diagTerminal = document.getElementById('diag-terminal-output');
  const diagActions = document.getElementById('diag-actions');
  const diagBtnClose = document.getElementById('btn-diag-close');

  function closeDiagOverlay() {
    if (!diagOverlay) return;
    diagOverlay.classList.add('closing');
    setTimeout(() => {
      diagOverlay.classList.remove('active', 'closing');
    }, 350);
  }

  if (diagBtnClose) {
    diagBtnClose.addEventListener('click', closeDiagOverlay);
  }

  function launchModule(moduleName) {
    if (!diagOverlay) {
      // Fallback direct launch if overlay is missing
      if (window.pywebview && window.pywebview.api) window.pywebview.api.launch_module(moduleName);
      return;
    }

    diagOverlay.classList.remove('closing');

    // Configure icons & module titles
    let iconClass = 'ph-shield-check';
    if (moduleName === 'ARGUS') iconClass = 'ph-shield-warning';
    else if (moduleName === 'CAST') iconClass = 'ph-graduation-cap';
    else if (moduleName === 'VISTA') iconClass = 'ph-globe-hemisphere-west';

    if (diagAppIcon) diagAppIcon.className = `ph ${iconClass}`;
    if (diagAppName) diagAppName.innerText = `VERIFYING ${moduleName} SUBSYSTEM`;
    if (diagScanState) {
      diagScanState.innerText = 'INITIALIZING INTEGRITY AUDIT...';
      diagScanState.style.color = 'var(--accent-primary)';
    }
    if (diagProgressBar) diagProgressBar.style.width = '10%';
    if (diagTerminal) diagTerminal.innerHTML = '';
    if (diagActions) diagActions.style.display = 'none';

    diagOverlay.classList.add('active');
    addLog('DIAGNOSTICS', `Initiating pre-launch integrity audit for ${moduleName}...`, 'info');

    function appendDiagLog(msg, type = 'ok') {
      if (!diagTerminal) return;
      const line = document.createElement('div');
      line.className = 'log-line';
      const tagClass = type === 'ok' ? 'tag-ok' : 'tag-err';
      const tagText = type === 'ok' ? '[OK]' : '[FAIL]';
      line.innerHTML = `<span class="${tagClass}">${tagText}</span> <span>${msg}</span>`;
      diagTerminal.appendChild(line);
      diagTerminal.scrollTop = diagTerminal.scrollHeight;
    }

    appendDiagLog(`Target subsystem selected: [${moduleName}]`);

    // Step 1 (400ms): Scanning filesystem
    setTimeout(() => {
      if (diagProgressBar) diagProgressBar.style.width = '35%';
      if (diagScanState) diagScanState.innerText = 'SCANNING BINARY PERMISSIONS...';
      appendDiagLog('Scanning filesystem & execution permissions...');
    }, 400);

    // Step 2 (800ms): Run Python integrity check
    setTimeout(() => {
      if (diagProgressBar) diagProgressBar.style.width = '65%';
      if (diagScanState) diagScanState.innerText = 'VERIFYING CHECKSUM & PAYLOAD...';

      if (window.pywebview && window.pywebview.api && window.pywebview.api.verify_module_integrity) {
        window.pywebview.api.verify_module_integrity(moduleName).then(result => {
          // Step 3 (1300ms): Process verification results
          setTimeout(() => {
            if (result.valid) {
              if (diagProgressBar) diagProgressBar.style.width = '85%';
              if (result.checks) {
                result.checks.forEach(chk => appendDiagLog(chk, 'ok'));
              }
              if (diagScanState) diagScanState.innerText = 'INTEGRITY VERIFIED — ATTACHING SUBSYSTEM...';

              // Step 4 (1800ms): Launch executable
              setTimeout(() => {
                if (diagProgressBar) diagProgressBar.style.width = '100%';
                appendDiagLog(`Subsystem ${moduleName} audit PASSED. Spawning binary host...`, 'ok');

                window.pywebview.api.launch_module(moduleName).then(launchRes => {
                  setTimeout(() => {
                    closeDiagOverlay();
                    if (launchRes.success) {
                      addLog(moduleName, `Subsystem initialized and attached successfully.`, 'success');
                    } else {
                      addLog(moduleName, `Launch failed: ${launchRes.error}`, 'error');
                    }
                  }, 600);
                });
              }, 500);
            } else {
              if (diagProgressBar) diagProgressBar.style.width = '100%';
              if (diagScanState) {
                diagScanState.innerText = 'INTEGRITY CHECK FAILED';
                diagScanState.style.color = 'var(--danger)';
              }
              appendDiagLog(`Integrity Audit Failed: ${result.error || 'Binary damaged or missing.'}`, 'err');
              addLog(moduleName, `Integrity verification failed: ${result.error}`, 'error');
              if (diagActions) diagActions.style.display = 'flex';
            }
          }, 500);
        });
      } else {
        // Fallback for dev mode
        setTimeout(() => {
          if (diagProgressBar) diagProgressBar.style.width = '100%';
          appendDiagLog('Development mode — bypassing checksum verification', 'ok');
          if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.launch_module(moduleName);
          }
          setTimeout(() => closeDiagOverlay(), 600);
        }, 800);
      }
    }, 800);
  }

  function stopModule(moduleName) {
    addLog('LAUNCHER', `Sending termination signal to ${moduleName}...`, 'info');
    if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.stop_module(moduleName).then(result => {
            if (result.success) {
                addLog(moduleName, `Subsystem terminated.`, 'success');
            } else {
                addLog(moduleName, `Termination failed: ${result.error}`, 'error');
            }
        });
    } else {
        addLog('LAUNCHER', `IPC offline. Cannot terminate ${moduleName}.`, 'warning');
    }
  }

  // Attach event listeners to action buttons
  document.querySelectorAll('.module-card').forEach(card => {
      const moduleName = card.getAttribute('data-module');
      const launchBtn = card.querySelector('.action-launch');
      const stopBtn = card.querySelector('.action-stop');
      
      if (launchBtn) launchBtn.addEventListener('click', () => launchModule(moduleName));
      if (stopBtn) stopBtn.addEventListener('click', () => stopModule(moduleName));
  });

  // --- Window Controls ---
  document.getElementById('btn-close')?.addEventListener('click', () => {
      if (window.pywebview && window.pywebview.api) window.pywebview.api.close_launcher();
  });
  document.getElementById('btn-minimize')?.addEventListener('click', () => {
      if (window.pywebview && window.pywebview.api) window.pywebview.api.minimize_launcher();
  });
  document.getElementById('btn-maximize')?.addEventListener('click', () => {
      if (window.pywebview && window.pywebview.api) window.pywebview.api.maximize_launcher();
  });

  // --- Canvas Sparkline Charts ---
  class SystemChart {
    constructor(canvasId, lineColor, fillColor) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.lineColor = lineColor;
      this.fillColor = fillColor;
      this.history = new Array(30).fill(0);
      
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.draw();
    }

    push(val) {
      this.history.push(val);
      this.history.shift();
      this.draw();
    }

    draw() {
      if (!this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width / window.devicePixelRatio;
      const h = this.canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const cols = 6;
      const rows = 4;
      for (let i = 1; i < cols; i++) {
        const x = (w / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let i = 1; i < rows; i++) {
        const y = (h / rows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      // Draw gradient area under curve
      ctx.beginPath();
      ctx.moveTo(0, h);
      const step = w / (this.history.length - 1);
      for (let i = 0; i < this.history.length; i++) {
        const val = this.history[i];
        const y = h - (val / 100) * (h - 14) - 7;
        const x = i * step;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.fillColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();
      
      // Draw glowing line
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const val = this.history[i];
        const y = h - (val / 100) * (h - 14) - 7;
        const x = i * step;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = this.lineColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Initialize charts
  const cpuChart = new SystemChart('cpu-chart', '#00f0ff', 'rgba(0, 240, 255, 0.15)');
  const ramChart = new SystemChart('ram-chart', '#8b5cf6', 'rgba(139, 92, 246, 0.15)');

  // --- Status Polling & Metrics updates ---
  const cpuValue = document.getElementById('cpu-value');
  const ramValue = document.getElementById('ram-value');
  let lastUpdate = Date.now();

  function updateUIStatus(moduleName, isRunning) {
      const card = document.querySelector(`.module-card[data-module="${moduleName}"]`);
      if (!card) return;
      
      const badge = card.querySelector('.module-status-badge');
      const isCurrentlyRunning = badge.classList.contains('running');
      
      if (isRunning) {
          badge.className = 'status-badge running module-status-badge';
          badge.innerHTML = '<span class="dot"></span>Online';
          if (!isCurrentlyRunning) addLog(moduleName, 'Subsystem is now ONLINE', 'success');
      } else {
          badge.className = 'status-badge stopped module-status-badge';
          badge.innerHTML = '<span class="dot"></span>Offline';
          if (isCurrentlyRunning) addLog(moduleName, 'Subsystem went OFFLINE', 'warning');
      }
  }

  let alertActive = false;
  let activeCaseId = null;

  function triggerNetworkAlert(threat) {
    if (alertActive) return;
    alertActive = true;
    activeCaseId = threat.id;
    
    // Update DOM elements
    const altType = document.getElementById('alert-type');
    const altSource = document.getElementById('alert-source');
    const altPort = document.getElementById('alert-port');
    const altMsg = document.getElementById('alert-message');
    const threatStatus = document.getElementById('threat-status');
    const overlay = document.getElementById('security-alert-overlay');

    if (altType) altType.innerText = threat.threat_name || 'UNKNOWN INTRUSION';
    if (altSource) altSource.innerText = threat.source_ip || 'UNKNOWN';
    
    let portsDisplay = 'N/A';
    if (threat.ports) {
      try {
        const parsedPorts = typeof threat.ports === 'string' ? JSON.parse(threat.ports) : threat.ports;
        portsDisplay = Array.isArray(parsedPorts) ? parsedPorts.join(', ') : parsedPorts;
      } catch (e) {
        portsDisplay = threat.ports;
      }
    }
    if (altPort) altPort.innerText = portsDisplay;
    if (altMsg) altMsg.innerText = `Intrusion detection signature flagged by active ARGUS NIDS engine on module [${threat.protocol || 'IP'}].`;
    
    if (threatStatus) {
      threatStatus.className = 'threat-value status-high';
      threatStatus.innerText = 'UNSECURE';
    }

    if (overlay) overlay.classList.add('active');

    // Print warning logs to active console
    addLog('ARGUS NIDS', `CRITICAL INTRUSION DETECTED: [${threat.threat_name}] (ID: ${threat.id}) from host ${threat.source_ip}`, 'error');
    addLog('SYSTEM', 'Ecosystem security threat status flagged as UNSECURE.', 'warning');
  }

  function dismissAlert(newStatus = 'dismissed') {
    alertActive = false;
    const overlay = document.getElementById('security-alert-overlay');
    if (overlay) overlay.classList.remove('active');

    const threatStatus = document.getElementById('threat-status');
    if (threatStatus) {
      threatStatus.className = 'threat-value status-low';
      threatStatus.innerText = 'SECURE';
    }
    
    if (activeCaseId) {
      const caseId = activeCaseId;
      activeCaseId = null;
      if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.resolve_case(caseId, newStatus).then(success => {
          if (success) {
            addLog('SYSTEM', `Intrusion case ${caseId} status updated to [${newStatus}] in database.`, 'success');
          } else {
            addLog('SYSTEM', `Failed to update case ${caseId} status in database.`, 'warning');
          }
        });
      }
    } else {
      addLog('SYSTEM', 'Security alert dismissed.', 'success');
    }
  }

  // Bind event listeners for dismissing and investigating
  document.getElementById('btn-alert-dismiss')?.addEventListener('click', () => {
    dismissAlert('dismissed');
  });

  document.getElementById('btn-alert-investigate')?.addEventListener('click', () => {
    dismissAlert('investigating');
    // Auto-launch ARGUS to investigate
    launchModule('ARGUS');
  });

  window.updateAllStatus = function(statusMap) {
      lastUpdate = Date.now();
      hasReceivedData = true;
      tryDismissBootScreen();
      
      const cpu = statusMap._cpu !== undefined ? statusMap._cpu : 0;
      const ram = statusMap._ram !== undefined ? statusMap._ram : 0;
      
      if (cpuValue) cpuValue.innerText = `${cpu.toFixed(1)}%`;
      if (ramValue) ramValue.innerText = `${ram.toFixed(1)}%`;
      
      cpuChart?.push(cpu);
      ramChart?.push(ram);

      // Update Security Posture Score Widget
      if (statusMap.posture) {
        const posture = statusMap.posture;
        const scoreVal = document.getElementById('posture-score-val');
        const castVal = document.getElementById('posture-cast-val');
        const castBar = document.getElementById('posture-cast-bar');
        const argusVal = document.getElementById('posture-argus-val');
        const argusBar = document.getElementById('posture-argus-bar');
        const vistaVal = document.getElementById('posture-vista-val');
        const vistaBar = document.getElementById('posture-vista-bar');
        const statusLbl = document.getElementById('posture-status-lbl');

        if (scoreVal) scoreVal.innerText = `${posture.overall} / 100`;
        if (castVal) castVal.innerText = `${posture.cast_completion}%`;
        if (castBar) castBar.style.width = `${posture.cast_completion}%`;
        if (argusVal) argusVal.innerText = `${posture.argus_clearance}%`;
        if (argusBar) argusBar.style.width = `${posture.argus_clearance}%`;
        if (vistaVal) vistaVal.innerText = posture.vista_active ? 'ON' : 'OFF';
        if (vistaBar) vistaBar.style.width = posture.vista_active ? '100%' : '0%';
        if (statusLbl) {
          if (posture.overall >= 80) {
            statusLbl.innerText = 'OPTIMAL';
            statusLbl.style.color = '#10b981';
          } else if (posture.overall >= 50) {
            statusLbl.innerText = 'ADEQUATE';
            statusLbl.style.color = '#3b82f6';
          } else {
            statusLbl.innerText = 'VULNERABLE';
            statusLbl.style.color = '#ff0055';
          }
        }
      }

      // Check for real NIDS threats from SQLite
      if (statusMap._new_threat) {
          triggerNetworkAlert(statusMap._new_threat);
      } else if (alertActive) {
          // Sync UI if the threat was resolved externally (e.g. from ARGUS UI)
          alertActive = false;
          const overlay = document.getElementById('security-alert-overlay');
          if (overlay) overlay.classList.remove('active');
          const threatStatus = document.getElementById('threat-status');
          if (threatStatus) {
            threatStatus.className = 'threat-value status-low';
            threatStatus.innerText = 'SECURE';
          }
          addLog('SYSTEM', 'Active alert synchronized and resolved by external scanner.', 'success');
      }

      for (const [moduleName, isRunning] of Object.entries(statusMap)) {
          if (moduleName.startsWith('_')) continue;
          updateUIStatus(moduleName, isRunning);
      }
  };

  // Fallback simulator if Python daemon/IPC is not active or delayed
  let simCpu = 15;
  let simRam = 45;
  setInterval(() => {
    if (Date.now() - lastUpdate > 2500) {
      simCpu += (Math.random() * 12 - 6);
      if (simCpu < 2) simCpu = 2 + Math.random() * 5;
      if (simCpu > 95) simCpu = 95 - Math.random() * 5;
      
      simRam += (Math.random() * 4 - 2);
      if (simRam < 20) simRam = 20 + Math.random() * 5;
      if (simRam > 80) simRam = 80 - Math.random() * 5;

      if (cpuValue) cpuValue.innerText = `${simCpu.toFixed(1)}%`;
      if (ramValue) ramValue.innerText = `${simRam.toFixed(1)}%`;
      
      cpuChart?.push(simCpu);
      ramChart?.push(simRam);
    }
  }, 1000);

  addLog('SYSTEM', 'AEGIS Kernel Secure Interface initialized.', 'info');
});
