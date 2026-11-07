(() => {
  'use strict';

  const TARGET_REVENUE = 100_000_000_000;
  const DURATION_SECONDS = 480;

  const dataMeta = {
    location:{label:'Location', emoji:'📍', tone:'green'},
    contacts:{label:'Contacts', emoji:'👥', tone:'blue'},
    dwell:{label:'Dwell', emoji:'⏱️', tone:'amber'},
    typing:{label:'Typing', emoji:'⌨️', tone:'purple'},
    purchase:{label:'Purchases', emoji:'🛒', tone:'green'},
    photo:{label:'Photos', emoji:'📸', tone:'purple'},
    night:{label:'Night', emoji:'🌙', tone:'blue'},
    motion:{label:'Motion', emoji:'📳', tone:'amber'},
    voice:{label:'Voice', emoji:'🎙️', tone:'purple'},
    search:{label:'Search', emoji:'🔎', tone:'green'}
  };

  const fieldLabels = {
    commute:'Commute',
    sleep:'Sleep',
    health:'Health',
    relationships:'Relationships',
    finances:'Finances'
  };

  const levers = [
    {id:'feed', name:'Neighborhood feed', icon:'📍', data:'location', rate:2.4, risk:0.055, desc:'Local recs, tuned to routine.'},
    {id:'social', name:'Contact sync', icon:'👥', data:'contacts', rate:1.8, risk:0.045, desc:'Find the people she already knows.'},
    {id:'watch', name:'Infinite watch', icon:'⏱️', data:'dwell', rate:2.8, risk:0.07, desc:'Keep the next clip impossible to ignore.'},
    {id:'keyboard', name:'Smart keyboard', icon:'⌨️', data:'typing', rate:1.4, risk:0.035, desc:'Predict her next sentence before she types it.'},
    {id:'shop', name:'Shoppable moments', icon:'🛒', data:'purchase', rate:2.0, risk:0.05, desc:'Turn impulse into conversion.'},
    {id:'camera', name:'Camera cloud', icon:'📸', data:'photo', rate:1.6, risk:0.055, desc:'Archive the images and the metadata.'},
    {id:'night', name:'Quiet hours insights', icon:'🌙', data:'night', rate:1.5, risk:0.04, desc:'The platform never sleeps.'},
    {id:'motion', name:'Motion context', icon:'📳', data:'motion', rate:1.5, risk:0.065, desc:'Movement adds up to motive.'},
    {id:'voice', name:'Voice assistant', icon:'🎙️', data:'voice', rate:1.7, risk:0.075, desc:'Always listening. Very helpful.'},
    {id:'search', name:'Search personalization', icon:'🔎', data:'search', rate:2.2, risk:0.06, desc:'Ask the question behind the question.'}
  ];

  const inferenceRecipes = [
    {id:'home', name:'Home address', recipe:[['location',3],['night',2]], field:'commute', text:'Leaves home at 7:40. Arrives late on Thursdays.', wrong:false, boost:1.12, emoji:'🏠'},
    {id:'insomnia', name:'Insomnia', recipe:[['night',2],['dwell',2]], field:'sleep', text:'Sleeps in fits, wakes around 2:13 a.m., and checks the feed again.', wrong:false, boost:1.12, emoji:'😵'},
    {id:'pregnancy', name:'Pregnancy likelihood', recipe:[['purchase',2],['search',2],['location',2]], field:'health', text:'Recently searched “ginger tea”, “prenatal vitamins”, and “how long does it take to feel better”.', wrong:true, boost:1.55, emoji:'🤰'},
    {id:'relationship', name:'Relationship status', recipe:[['photo',2],['contacts',2]], field:'relationships', text:'There are two toothbrushes in the bathroom. Probably.', wrong:false, boost:1.16, emoji:'💑'},
    {id:'jobloss', name:'Job loss risk', recipe:[['search',2],['location',2],['dwell',2]], field:'finances', text:'Looks up severance advice on weekdays and updates a spreadsheet by hand.', wrong:false, boost:1.18, emoji:'💸'},
    {id:'commute', name:'Commute pattern', recipe:[['location',3],['motion',2]], field:'commute', text:'Takes the 14 bus. Avoids the bridge stop by habit.', wrong:false, boost:1.14, emoji:'🚍'},
    {id:'socialgraph', name:'Social graph', recipe:[['contacts',3],['typing',2]], field:'relationships', text:'The same three names reply within a minute. One person waits all day.', wrong:false, boost:1.14, emoji:'🧠'},
    {id:'household', name:'Household composition', recipe:[['voice',2],['purchase',2],['location',2]], field:'finances', text:'Buys oat milk for one person and cereal for five. There are probably visitors.', wrong:true, boost:1.16, emoji:'🏡'},
    {id:'routine', name:'Weekly routine', recipe:[['location',2],['dwell',2],['night',2]], field:'commute', text:'Wednesday is grocery night. Thursday is where the routine breaks down.', wrong:false, boost:1.12, emoji:'📆'},
    {id:'anxiety', name:'Anxiety signal', recipe:[['typing',2],['search',2]], field:'health', text:'Types a message, deletes it, then searches for the right words.', wrong:false, boost:1.20, emoji:'😬'},
    {id:'financial', name:'Financial stress', recipe:[['purchase',2],['search',2]], field:'finances', text:'Checks the checking account before ordering, then buys anyway.', wrong:false, boost:1.22, emoji:'📉'},
    {id:'relationshiprisk', name:'Relationship risk', recipe:[['photo',2],['contacts',2],['night',2]], field:'relationships', text:'A new name shows up after midnight more often than the others.', wrong:true, boost:1.15, emoji:'⚠️', exclusive:'relationship-choice'},
    {id:'loyalty', name:'Brand loyalty', recipe:[['purchase',2],['dwell',2],['typing',2]], field:'finances', text:'Always chooses the same blue package. The algorithm calls it trust.', wrong:false, boost:1.2, emoji:'📦', exclusive:'relationship-choice'},
    {id:'health', name:'Health event likelihood', recipe:[['search',2],['night',2],['location',2]], field:'health', text:'Looks up clinic hours, then looks up the clinic address.', wrong:false, boost:1.25, emoji:'🩺', exclusive:'health-choice'},
    {id:'caregiver', name:'Caregiver status', recipe:[['location',2],['contacts',2],['voice',2]], field:'relationships', text:'Someone else’s pharmacy pickup is always on her route.', wrong:true, boost:1.22, emoji:'🧑‍⚕️', exclusive:'health-choice'}
  ];

  const tutorialSteps = [
    'The Board wants the first signal: turn on <strong>Neighborhood feed</strong>.',
    'Nice. The platform is harvesting <strong>📍 location</strong> and <strong>🌙 night</strong> data.',
    'Now make one inference. You need enough data to unlock it.',
    'Every learning fills in Maya’s profile. Some guesses are wrong. That is okay.',
    'Keep growth high, but keep awareness low. The Board is watching.'
  ];

  const headlineBank = [
    'No one is watching yet.',
    'Maya keeps to herself — for now.',
    'A quiet record is a useful record.',
    'The platform is quietly outperforming expectations.',
    'A small story is becoming a bigger one.',
    'The regulator is taking notes.',
    'The press has started asking questions.',
    'This quarter is becoming expensive.'
  ];

  const introAudio = {
    data:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=',
    win:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=',
    alert:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='
  };

  const state = {
    started:false,
    paused:false,
    ended:false,
    onlyOnce:true,
    currentStep:0,
    second:0,
    users:10000,
    revenue:0,
    awareness:8,
    inventory:Object.fromEntries(Object.keys(dataMeta).map(key => [key,0])),
    active:new Set(),
    unlocked:new Set(),
    unlockedLevers:new Set(['feed','social','watch','keyboard','shop']),
    dossier:{},
    wrong:new Set(),
    events:[],
    totalInferences:0,
    regulatorFired:false,
    regulatorCooldown:0,
    forcedOff:null,
    press:0,
    rebrandUsed:false,
    lobbying:0,
    privacy:0,
    exclusive:{},
    headlineIndex:0,
    audioEnabled:true
  };

  const els = {
    introScreen: document.getElementById('intro-screen'),
    gameScreen: document.getElementById('game-screen'),
    startButton: document.getElementById('start-button'),
    tutorialBox: document.getElementById('tutorial-box'),
    leverList: document.getElementById('lever-list'),
    inventory: document.getElementById('inventory'),
    inferenceList: document.getElementById('inference-list'),
    usersValue: document.getElementById('users-value'),
    usersRate: document.getElementById('users-rate'),
    revenueValue: document.getElementById('revenue-value'),
    revenueRate: document.getElementById('revenue-rate'),
    revenueBar: document.getElementById('revenue-bar'),
    awarenessValue: document.getElementById('awareness-value'),
    awarenessStatus: document.getElementById('awareness-status'),
    awarenessBar: document.getElementById('awareness-bar'),
    regulatorState: document.getElementById('regulator-state'),
    regulatorBar: document.getElementById('regulator-bar'),
    pressState: document.getElementById('press-state'),
    pressBar: document.getElementById('press-bar'),
    headlineBox: document.getElementById('headline-box'),
    eventFeed: document.getElementById('event-feed'),
    endScreen: document.getElementById('end-screen'),
    endTitle: document.getElementById('end-title'),
    endSummary: document.getElementById('end-summary'),
    endBadge: document.getElementById('end-badge'),
    endDossier: document.getElementById('end-dossier'),
    restartButton: document.getElementById('restart-button'),
    revealPanel: document.getElementById('reveal-panel'),
    toast: document.getElementById('toast'),
    tokenLayer: document.getElementById('token-layer'),
    activeCount: document.getElementById('active-count'),
    inferenceCount: document.getElementById('inference-count'),
    suspicionFace: document.getElementById('suspicion-face'),
    dossierFields: document.getElementById('dossier-fields'),
    pauseButton: document.getElementById('pause-button'),
    muteButton: document.getElementById('mute-button')
  };

  let tickLoop;

  function formatMoney(amount) {
    if (amount >= 1e12) return '$' + (amount / 1e12).toFixed(2) + 'T';
    if (amount >= 1e9) return '$' + (amount / 1e9).toFixed(2) + 'B';
    if (amount >= 1e6) return '$' + (amount / 1e6).toFixed(1) + 'M';
    if (amount >= 1e3) return '$' + (amount / 1e3).toFixed(0) + 'K';
    return '$' + Math.floor(amount);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.floor(value));
  }

  function beep(type='data') {
    if (!state.audioEnabled) return;
    const audio = new Audio(introAudio[type] || introAudio.data);
    audio.volume = type === 'alert' ? 0.5 : 0.25;
    audio.play().catch(() => {});
  }

  function showToast(message) {
    const el = els.toast;
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.classList.remove('visible'), 1800);
  }

  function updateTutorial() {
    const step = tutorialSteps[Math.min(state.currentStep, tutorialSteps.length - 1)];
    els.tutorialBox.innerHTML = step || 'The Board is waiting.';
    els.tutorialBox.classList.add('flash');
    setTimeout(() => els.tutorialBox.classList.remove('flash'), 220);
  }

  function createToken(x, y, token) {
    const el = document.createElement('div');
    el.className = 'token';
    el.textContent = token;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${(Math.random() * 90 - 45).toFixed(1)}px`);
    el.style.setProperty('--dy', `${(-90 - Math.random() * 80).toFixed(1)}px`);
    els.tokenLayer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  function emitTokensFromLever(id) {
    const button = document.querySelector(`.lever-card[data-id="${id}"] .toggle`);
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const tokenMap = {
      feed:'📍', social:'👥', watch:'⏱️', keyboard:'⌨️', shop:'🛒',
      camera:'📸', night:'🌙', motion:'📳', voice:'🎙️', search:'🔎'
    };
    const token = tokenMap[id] || '✨';
    createToken(x, y, token);
    beep('data');
  }

  function renderLevers() {
    els.leverList.innerHTML = '';

    levers.forEach(lever => {
      const active = state.active.has(lever.id);
      const card = document.createElement('div');
      card.className = `lever-card ${active ? 'active' : ''}`;
      card.dataset.id = lever.id;

      card.innerHTML = `
        <div class="top">
          <div class="lever-icon">${lever.icon}</div>
          <div class="lever-copy">
            <h4>${lever.name}</h4>
            <p>${lever.desc}</p>
          </div>
          <button class="toggle" aria-label="${active ? 'Disable' : 'Enable'} ${lever.name}" data-id="${lever.id}"></button>
        </div>
        <div class="lever-foot">
          <span class="yield">+${formatMoney(lever.rate * 1e6)}/s</span>
          <span class="risk">+${lever.risk.toFixed(2)} A/s</span>
        </div>
      `;

      card.querySelector('.toggle').addEventListener('click', () => {
        toggleLever(lever.id);
      });

      els.leverList.appendChild(card);
    });

    els.activeCount.textContent = `${state.active.size} ACTIVE`;
  }

  function renderInventory() {
    els.inventory.innerHTML = '';

    Object.entries(dataMeta).forEach(([key, meta]) => {
      const item = document.createElement('div');
      item.className = 'inventory-item';
      item.innerHTML = `
        <span class="inventory-token">${meta.emoji}</span>
        <div class="inventory-value">${formatNumber(state.inventory[key])}</div>
        <span class="inventory-label">${meta.label}</span>
      `;
      els.inventory.appendChild(item);
    });
  }

  function inferenceReady(inf) {
    return inf.recipe.every(([key, amount]) => state.inventory[key] >= amount);
  }

  function recipeString(inf) {
    return inf.recipe.map(([key, amount]) => `${dataMeta[key].emoji} ${amount}`).join(' + ');
  }

  function renderInferences() {
    els.inferenceList.innerHTML = '';

    inferenceRecipes.forEach(inf => {
      const ready = inferenceReady(inf);
      const unlocked = state.unlocked.has(inf.id);
      const blocked = inf.exclusive && state.exclusive[inf.exclusive] && state.exclusive[inf.exclusive] !== inf.id;

      const card = document.createElement('div');
      card.className = `inference-card ${unlocked ? 'unlocked' : ready ? 'ready' : 'locked'}`;

      if (unlocked) {
        card.innerHTML = `
          <div class="inference-head">
            <span>${inf.emoji}</span>
            <span>Leaked</span>
          </div>
          <div class="inference-name">${inf.name}</div>
          <div class="inference-recipe">${inf.text}</div>
        `;
      } else if (blocked) {
        card.innerHTML = `
          <div class="inference-head">
            <span>🚫</span>
            <span>Blocked</span>
          </div>
          <div class="inference-name">Unknown</div>
          <div class="inference-recipe">Mutually exclusive branch</div>
        `;
      } else {
        card.innerHTML = `
          <div class="inference-head">
            <span>${inf.emoji}</span>
            <span>${ready ? 'Ready' : 'Locked'}</span>
          </div>
          <div class="inference-name">${inf.name}</div>
          <div class="inference-recipe">${recipeString(inf)}</div>
          <button class="inference-button ${ready ? 'ready' : ''}" ${ready ? '' : 'disabled'}>Learn</button>
        `;
        const button = card.querySelector('.inference-button');
        if (button) button.addEventListener('click', () => craftInference(inf.id));
      }

      els.inferenceList.appendChild(card);
    });

    els.inferenceCount.textContent = `${state.unlocked.size} / ${inferenceRecipes.length}`;
  }

  function renderDossier() {
    els.dossierFields.innerHTML = '';

    Object.entries(fieldLabels).forEach(([key, label]) => {
      const value = state.dossier[key];
      const row = document.createElement('div');
      row.className = 'dossier-row';

      row.innerHTML = `
        <div class="dossier-key">${label}</div>
        <div class="dossier-value ${value ? (state.wrong.has(key) ? 'wrong' : '') : 'empty'}">
          ${value || '…'}
          ${value && state.wrong.has(key) ? '<span class=\"warning-note\">Low confidence • model output</span>' : ''}
        </div>
      `;

      els.dossierFields.appendChild(row);
    });
  }

  function renderEvents() {
    els.eventFeed.innerHTML = '';
    state.events.slice(0,6).forEach(event => {
      const row = document.createElement('div');
      row.className = 'event-item';
      row.innerHTML = `<strong>${event.time}</strong> ${event.text}`;
      els.eventFeed.appendChild(row);
    });
  }

  function currentRates() {
    const active = levers.filter(l => state.active.has(l.id));
    const mult = [...state.unlocked].reduce((total, id) => {
      const inf = inferenceRecipes.find(item => item.id === id);
      return total * (inf ? inf.boost : 1);
    }, 1);

    return {
      users: active.reduce((total, lever) => total + lever.rate * 155, 0),
      revenue: active.reduce((total, lever) => total + lever.rate, 0) * 1e7 * mult
    };
  }

  function setHeadline(text) {
    const headline = document.querySelector('#headline-box .headline');
    if (headline) headline.textContent = text;
  }

  function renderStats() {
    const rates = currentRates();

    els.usersValue.textContent = formatNumber(state.users);
    els.usersRate.textContent = `+${formatNumber(rates.users)}/sec`;
    els.revenueValue.textContent = formatMoney(state.revenue);
    els.revenueRate.textContent = `+$${formatNumber(rates.revenue)}/sec`;
    els.revenueBar.style.width = `${Math.min(100, (state.revenue / TARGET_REVENUE) * 100)}%`;

    els.awarenessValue.textContent = Math.floor(state.awareness);
    els.awarenessStatus.textContent = state.awareness >= 60 ? 'ELEVATED' : state.awareness >= 35 ? 'RISING' : 'LOW';
    els.awarenessBar.style.width = `${Math.min(100, state.awareness)}%`;

    els.regulatorState.textContent = state.regulatorFired ? (state.regulatorCooldown > 0 ? 'ACTIVE' : 'COOLED') : 'DORMANT';
    els.regulatorBar.style.width = `${Math.min(100, state.awareness / 60 * 100)}%`;

    els.pressState.textContent = state.press >= 75 ? 'PUBLISHING' : state.press >= 40 ? 'HUNTING' : 'QUIET';
    els.pressBar.style.width = `${Math.min(100, state.press)}%`;

    const suspicion = Math.min(5, Math.floor(state.awareness / 20));
    const faces = ['◕', '◔', '◑', '◐', '☹'];
    els.suspicionFace.textContent = faces[suspicion] || '◕';

    setHeadline(headlineBank[Math.min(state.headlineIndex, headlineBank.length - 1)]);
  }

  function pushEvent(text) {
    const time = `${String(Math.floor(state.second / 60)).padStart(2,'0')}:${String(state.second % 60).padStart(2,'0')}`;
    state.events.unshift({time, text});
    state.events = state.events.slice(0,6);
    renderEvents();
  }

  function showReveal(inf) {
    const panel = els.revealPanel;
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div class="reveal-kicker">New learning</div>
      <div class="reveal-emoji">${inf.emoji}</div>
      <div class="reveal-title">${inf.name}</div>
      <div class="reveal-copy">${inf.text}</div>
    `;
    setTimeout(() => panel.classList.add('hidden'), 2800);
  }

  function craftInference(id) {
    const inf = inferenceRecipes.find(item => item.id === id);
    if (!inf || state.unlocked.has(id) || state.ended) return;
    if (inf.exclusive && state.exclusive[inf.exclusive]) return;

    const ready = inferenceReady(inf);
    if (!ready) return;

    inf.recipe.forEach(([key, amount]) => {
      state.inventory[key] -= amount;
    });

    state.unlocked.add(id);
    state.totalInferences += 1;

    if (inf.exclusive) state.exclusive[inf.exclusive] = id;
    if (inf.lever) state.unlockedLevers.add(inf.lever);

    state.dossier[inf.field] = inf.text;
    if (inf.wrong) state.wrong.add(inf.field);

    showReveal(inf);
    beep('win');
    showToast(`${inf.name} learned`);
    pushEvent(`<strong>${inf.name}</strong> learned from the signal pool.`);
    updateTutorial();

    if (state.currentStep < tutorialSteps.length - 1) {
      state.currentStep += 1;
    }
  }

  function toggleLever(id) {
    if (state.ended) return;

    const lever = levers.find(item => item.id === id);
    if (!lever) return;

    if (state.active.has(id)) {
      state.active.delete(id);
      pushEvent(`<strong>${lever.name}</strong> offline.`);
    } else {
      state.active.add(id);
      emitTokensFromLever(id);
      pushEvent(`<strong>${lever.name}</strong> online.`);
    }

    if (state.currentStep === 0 && state.active.size > 0) {
      state.currentStep = 1;
    }

    renderLevers();
    renderStats();
    renderInventory();
    renderInferences();
    updateTutorial();
  }

  function buyCounter(type) {
    const costMap = {
      lobbying:250e6,
      rebrand:1e9,
      privacy:500e6
    };

    if (state.ended) return;
    const cost = costMap[type];
    if (state.revenue < cost) {
      showToast('Not enough valuation.');
      return;
    }

    if (type === 'rebrand' && state.rebrandUsed) {
      showToast('Rebrand already used.');
      return;
    }

    if (type === 'lobbying' && state.lobbying > 0) return;
    if (type === 'privacy' && state.privacy > 0) return;

    state.revenue -= cost;

    if (type === 'rebrand') {
      state.rebrandUsed = true;
      state.awareness = Math.max(0, state.awareness - 25);
      showToast('Rebrand deployed. Awareness resets.');
      pushEvent('<strong>Rebrand</strong> scrubbed the narrative.');
    }

    if (type === 'lobbying') {
      state.lobbying = 60;
      showToast('Lobbying engaged.');
      pushEvent('<strong>Lobbying</strong> slowed the regulator.');
    }

    if (type === 'privacy') {
      state.privacy = 20;
      showToast('Privacy theater engaged.');
      pushEvent('<strong>Privacy theater</strong> paused growth.');
    }

    renderStats();
  }

  function stepGame() {
    if (!state.started || state.paused || state.ended) return;

    state.second += 1;

    const rates = currentRates();
    state.users += rates.users;
    state.revenue += rates.revenue;

    levers.forEach(lever => {
      if (state.active.has(lever.id)) {
        state.inventory[lever.data] += 1;
      }
    });

    if (state.privacy > 0) {
      state.privacy -= 1;
    } else {
      state.awareness += 0.04 + levers.filter(l => state.active.has(l.id)).reduce((sum, l) => sum + l.risk, 0);
    }

    if (state.lobbying > 0) state.lobbying -= 1;
    if (state.press > 0) state.press += 0.08;

    if (state.press >= 100) {
      state.press = 0;
      state.awareness += 15;
      showToast('The press ran the story.');
      beep('alert');
      pushEvent('<strong>Press leak.</strong> Awareness jumps by 15.');
    }

    if (state.awareness >= 60 && !state.regulatorFired) {
      state.regulatorFired = true;
      state.regulatorCooldown = 30;

      const actives = [...state.active];
      if (actives.length) {
        const target = actives[Math.floor(Math.random() * actives.length)];
        state.active.delete(target);
        state.forcedOff = target;
        showToast('Regulator investigation: one lever shut off.');
        pushEvent(`<strong>Regulator investigation.</strong> ${levers.find(l => l.id === target).name} is suspended.`);
      }
    }

    if (state.forcedOff) {
      state.regulatorCooldown -= 1;
      if (state.regulatorCooldown <= 0) {
        state.forcedOff = null;
        pushEvent('<strong>Regulatory hold lifted.</strong>');
      }
    }

    if (state.headlineIndex < headlineBank.length - 1) {
      state.headlineIndex = Math.min(headlineBank.length - 1, Math.floor(state.awareness / 20));
    }

    if (state.currentStep === 2 && state.unlocked.size > 0) {
      state.currentStep = 3;
    }

    if (state.revenue >= TARGET_REVENUE) {
      endGame(true);
      return;
    }

    if (state.awareness >= 100) {
      endGame(false);
      return;
    }

    if (state.second >= DURATION_SECONDS) {
      endGame(false, true);
      return;
    }

    renderStats();
    renderInventory();
    renderLevers();
    renderInferences();
    renderDossier();
    renderEvents();
  }

  function endGame(won, timedOut = false) {
    state.ended = true;
    state.paused = false;
    els.gameScreen.classList.remove('active');
    els.endScreen.classList.remove('hidden');

    const endBadge = won ? 'SUCCESS' : timedOut ? 'TIME UP' : 'FAILED';
    const endTitle = won ? 'Maya is a market now.' : timedOut ? 'The quarter ended before the story arrived.' : 'The platform was deleted.';
    const endSummary = won
      ? 'The platform reached $100B valuation. Maya is complete, and the files still contain the wrong entries.'
      : timedOut
        ? 'The Board ran out of time. The dossier remains partial, but the story is still there.'
        : 'Awareness hit 100. The platform crashed, and the users disappeared.';

    els.endBadge.textContent = endBadge;
    els.endTitle.textContent = endTitle;
    els.endSummary.textContent = endSummary;

    const endRows = Object.entries(fieldLabels).map(([key, label]) => {
      const value = state.dossier[key];
      return `
        <div class="dossier-row">
          <div class="dossier-key">${label}</div>
          <div class="dossier-value ${value ? (state.wrong.has(key) ? 'wrong' : '') : 'empty'}">
            ${value || '…'}
            ${value && state.wrong.has(key) ? '<span class=\"warning-note\">Low confidence • model output</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    els.endDossier.innerHTML = endRows;

    beep('alert');
  }

  function startGame() {
    state.started = true;
    state.paused = false;
    state.ended = false;
    els.introScreen.classList.remove('active');
    els.gameScreen.classList.add('active');
    state.currentStep = 0;
    updateTutorial();
    renderLevers();
    renderInventory();
    renderInferences();
    renderDossier();
    renderStats();
    renderEvents();
    if (!tickLoop) tickLoop = setInterval(stepGame, 1000);
  }

  function resetGame() {
    Object.assign(state, {
      started:false,
      paused:false,
      ended:false,
      currentStep:0,
      second:0,
      users:10000,
      revenue:0,
      awareness:8,
      inventory:Object.fromEntries(Object.keys(dataMeta).map(key => [key,0])),
      active:new Set(),
      unlocked:new Set(),
      unlockedLevers:new Set(['feed','social','watch','keyboard','shop']),
      dossier:{},
      wrong:new Set(),
      events:[],
      regulatorFired:false,
      regulatorCooldown:0,
      forcedOff:null,
      press:0,
      lobbying:0,
      privacy:0,
      rebrandUsed:false,
      exclusive:{},
      headlineIndex:0
    });

    els.endScreen.classList.add('hidden');
    els.introScreen.classList.add('active');
    els.gameScreen.classList.remove('active');
  }

  document.getElementById('start-button').addEventListener('click', startGame);
  els.restartButton.addEventListener('click', () => {
    resetGame();
  });

  document.querySelectorAll('.counter-button').forEach(button => {
    button.addEventListener('click', () => buyCounter(button.dataset.type));
  });

  els.pauseButton.addEventListener('click', () => {
    if (!state.started || state.ended) return;
    state.paused = !state.paused;
    els.pauseButton.textContent = state.paused ? '▶' : '⏸';
  });

  els.muteButton.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    els.muteButton.textContent = state.audioEnabled ? '🔊' : '🔇';
  });

  updateTutorial();
  renderLevers();
  renderInventory();
  renderInferences();
  renderDossier();
  renderStats();
  renderEvents();
})();
