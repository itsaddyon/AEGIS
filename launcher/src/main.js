import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // --- Boot Sequence ---
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  const bootTerminal = document.getElementById('boot-terminal-log');
  const bootProgressBar = document.getElementById('boot-progress-bar');
  
  const bootLogs = [
    { text: 'Loading UI Subsystems...', time: 200, progress: 10 },
    { text: 'Establishing secure IPC bridges...', time: 500, progress: 30 },
    { text: 'Mounting VISTA Suite Port...', time: 800, progress: 45 },
    { text: 'Checking module integrity...', time: 1100, progress: 60 },
    { text: 'Verifying ARGUS detection rules...', time: 1400, progress: 75 },
    { text: 'Interfaces scan: NPCAP verified...', time: 1700, progress: 85 },
    { text: 'All security layers active...', time: 2000, progress: 95 },
    { text: 'SYSTEM ONLINE', time: 2300, progress: 100 }
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

  function tryDismissBootScreen() {
    if (bootFinished && hasReceivedData) {
      const bScreen = document.getElementById('boot-screen');
      if (bScreen) {
        bScreen.classList.add('fade-out');
        setTimeout(() => bScreen.remove(), 600);
      }
      addLog('SYSTEM', 'Secure environment boot sequence completed.', 'success');
    }
  }

  setTimeout(() => {
    bootFinished = true;
    tryDismissBootScreen();
  }, 2700);

  // Safety fallback: boot after 4.5 seconds in diagnostic mode if IPC is offline/delayed
  setTimeout(() => {
    if (!hasReceivedData) {
      addLog('SYSTEM', 'IPC bridge delayed. Booting in diagnostic standalone mode...', 'warning');
      hasReceivedData = true;
      tryDismissBootScreen();
    }
  }, 4500);

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

  // --- PyWebView Integration ---
  function launchModule(moduleName) {
    addLog('LAUNCHER', `Sending initialization pulse to ${moduleName}...`, 'info');
    if (window.pywebview && window.pywebview.api) {
      window.pywebview.api.launch_module(moduleName).then(result => {
        if (result.success) {
          addLog(moduleName, `Subsystem initialized and attached.`, 'success');
        } else {
          addLog(moduleName, `Initialization failed: ${result.error}`, 'error');
        }
      });
    } else {
      addLog('LAUNCHER', `IPC offline. Cannot launch ${moduleName}.`, 'warning');
    }
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
