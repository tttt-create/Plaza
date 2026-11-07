(() => {
  'use strict';

  const TARGET_REVENUE = 100_000_000_000;
  const RUN_SECONDS = 480;

  const dataDefs = {
    location: { label: 'Location', emoji: '📍' },
    contacts: { label: 'Contacts', emoji: '👥' },
    dwell: { label: 'Dwell', emoji: '⏱️' },
    typing: { label: 'Typing', emoji: '⌨️' },
    purchase: { label: 'Purchase', emoji: '🛒' },
    photo: { label: 'Photo', emoji: '📸' },
    night: { label: 'Night', emoji: '🌙' },
    motion: { label: 'Motion', emoji: '📳' },
    voice: { label: 'Voice', emoji: '🎙️' },
    search: { label: 'Search', emoji: '🔎' }
  };

  const fieldLabels = {
    commute: 'Commute',
    sleep: 'Sleep',
    health: 'Health',
    relationships: 'Relationships',
    finances: 'Finances'
  };

  const levers = [
    { id: 'feed', name: 'Neighborhood feed', icon: '📍', data: 'location', rate: 2.3, risk: 0.055, copy: 'Local recommendations tuned to routine.' },
    { id: 'social', name: 'Contact sync', icon: '👥', data: 'contacts', rate: 1.8, risk: 0.045, copy: 'Find the people users already know.' },
    { id: 'watch', name: 'Infinite watch', icon: '⏱️', data: 'dwell', rate: 2.8, risk: 0.07, copy: 'Keep the next clip impossible to ignore.' },
    { id: 'keyboard', name: 'Smart keyboard', icon: '⌨️', data: 'typing', rate: 1.4, risk: 0.035, copy: 'Predict the next sentence before it is typed.' },
    { id: 'shop', name: 'Shoppable moments', icon: '🛒', data: 'purchase', rate: 2.0, risk: 0.05, copy: 'Turn impulse into conversion.' },
    { id: 'camera', name: 'Camera cloud', icon: '📸', data: 'photo', rate: 1.6, risk: 0.055, copy: 'Archive the image and the metadata.' },
    { id: 'night', name: 'Quiet hours insights', icon: '🌙', data: 'night', rate: 1.5, risk: 0.04, copy: 'The platform never sleeps.' },
    { id: 'motion', name: 'Motion context', icon: '📳', data: 'motion', rate: 1.5, risk: 0.065, copy: 'Movement adds up to motive.' },
    { id: 'voice', name: 'Voice assistant', icon: '🎙️', data: 'voice', rate: 1.7, risk: 0.075, copy: 'Helpful, even when nobody asked.' },
    { id: 'search', name: 'Search personalization', icon: '🔎', data: 'search', rate: 2.2, risk: 0.06, copy: 'Ask the question behind the question.' }
  ];

  const inferences = [
    { id: 'home', name: 'Home address', recipe: [['location', 3], ['night', 2]], field: 'commute', text: 'Leaves home at 7:40. Arrives late on Thursdays.', boost: 1.12, wrong: false, emoji: '🏠' },
    { id: 'insomnia', name: 'Insomnia', recipe: [['night', 2], ['dwell', 2]], field: 'sleep', text: 'Sleeps in fits and checks the feed around 2:13 a.m.', boost: 1.12, wrong: false, emoji: '😵' },
    { id: 'pregnancy', name: 'Pregnancy likelihood', recipe: [['purchase', 2], ['search', 2], ['location', 2]], field: 'health', text: 'Recently searched “prenatal vitamins”, “ginger tea”, and “how do I feel better”.', boost: 1.55, wrong: true, emoji: '🤰' },
    { id: 'relationship', name: 'Relationship status', recipe: [['photo', 2], ['contacts', 2]], field: 'relationships', text: 'There are two toothbrushes in the bathroom and only one is recently used.', boost: 1.16, wrong: false, emoji: '💑' },
    { id: 'jobloss', name: 'Job loss risk', recipe: [['search', 2], ['location', 2], ['dwell', 2]], field: 'finances', text: 'Looks up severance advice on weekdays and tracks expenses by hand.', boost: 1.18, wrong: false, emoji: '💸' },
    { id: 'commute', name: 'Commute pattern', recipe: [['location', 3], ['motion', 2]], field: 'commute', text: 'Takes the 14 bus. Avoids the bridge stop by habit.', boost: 1.14, wrong: false, emoji: '🚍' },
    { id: 'socialgraph', name: 'Social graph', recipe: [['contacts', 3], ['typing', 2]], field: 'relationships', text: 'The same three names respond within a minute. One person always waits.', boost: 1.14, wrong: false, emoji: '🧠' },
    { id: 'household', name: 'Household composition', recipe: [['voice', 2], ['purchase', 2], ['location', 2]], field: 'finances', text: 'Buys oat milk for one person and cereal for five. There are likely guests.', boost: 1.16, wrong: true, emoji: '🏡' },
    { id: 'routine', name: 'Weekly routine', recipe: [['location', 2], ['dwell', 2], ['night', 2]], field: 'commute', text: 'Wednesday is groceries. Thursday is where the routine breaks down.', boost: 1.12, wrong: false, emoji: '📅' },
    { id: 'anxiety', name: 'Anxiety signal', recipe: [['typing', 2], ['search', 2]], field: 'health', text: 'Types a message, deletes it, then searches for the right words.', boost: 1.2, wrong: false, emoji: '😬' },
    { id: 'financial', name: 'Financial stress', recipe: [['purchase', 2], ['search', 2]], field: 'finances', text: 'Checks the account balance before ordering, then buys anyway.', boost: 1.22, wrong: false, emoji: '📉' },
    { id: 'relationshiprisk', name: 'Relationship risk', recipe: [['photo', 2], ['contacts', 2], ['night', 2]], field: 'relationships', text: 'A new name appears after midnight more often than the others.', boost: 1.15, wrong: true, emoji: '⚠️' },
    { id: 'loyalty', name: 'Brand loyalty', recipe: [['purchase', 2], ['dwell', 2], ['typing', 2]], field: 'finances', text: 'Always chooses the same blue pack. The platform calls it trust.', boost: 1.2, wrong: false, emoji: '📦' },
    { id: 'health', name: 'Health event likelihood', recipe: [['search', 2], ['night', 2], ['location', 2]], field: 'health', text: 'Looks up clinic hours, then looks up the clinic address.', boost: 1.25, wrong: false, emoji: '🩺' },
    { id: 'caregiver', name: 'Caregiver status', recipe: [['location', 2], ['contacts', 2], ['voice', 2]], field: 'relationships', text: 'Someone else’s pharmacy pickup is often on her route.', boost: 1.22, wrong: true, emoji: '🧑‍⚕️' }
  ];

  const distractions = [
    { id: 'trend', label: 'Viral trend', icon: '🚀', description: 'Wide and brief. Harvests while it runs.', cooldown: 20, duration: 12, reduction: 30 },
    { id: 'scandal', label: 'Rival scandal', icon: '🕵️', description: 'Big hit, longer cooldown, industry risk.', cooldown: 30, duration: 0, reduction: 45 },
    { id: 'outrage', label: 'Outrage topic', icon: '🔥', description: 'Powerful, but damages the user base.', cooldown: 18, duration: 0, reduction: 50 },
    { id: 'launch', label: 'Feature launch', icon: '✨', description: 'Costs cash and consumes roadmap.', cooldown: 24, duration: 0, reduction: 25 }
  ];

  const tutorialSteps = [
    'Turn on <strong>Neighborhood feed</strong> to start collecting location pings.',
    'Every active lever feeds a stockpile. Physical data is visible as it flows into the jar.',
    'When an inference is ready, it consumes the required stock and fills in Maya’s dossier.',
    'Watch attention. A hot spot means a cluster of users is noticing something.',
    'Use a distraction before the attention spike becomes fatal.'
  ];

  const state = {
    started: false,
    paused: false,
    ended: false,
    seconds: 0,
    users: 10000,
    revenue: 0,
    awareness: 8,
    attention: 0,
    inventory: Object.fromEntries(Object.keys(dataDefs).map(key => [key, 0])),
    active: new Set(),
    unlocked: new Set(),
    dossier: {},
    wrong: new Set(),
    events: [],
    boardStep: 0,
    regulatorFired: false,
    regulatorCooldown: 0,
    forcedOff: null,
    press: 0,
    hotspot: null,
    activeDistraction: null,
    distractionCooldowns: Object.fromEntries(distractions.map(item => [item.id, 0])),
    privacy: 0,
    lobbying: 0,
    rebrandUsed: false
  };

  const els = {
    clock: document.getElementById('clock'),
    usersValue: document.getElementById('users-value'),
    usersRate: document.getElementById('users-rate'),
    revenueValue: document.getElementById('revenue-value'),
    revenueRate: document.getElementById('revenue-rate'),
    revenueBar: document.getElementById('revenue-bar'),
    awarenessValue: document.getElementById('awareness-value'),
    awarenessStatus: document.getElementById('awareness-status'),
    awarenessBar: document.getElementById('awareness-bar'),
    activeCount: document.getElementById('active-count'),
    instructionBox: document.getElementById('instruction-box'),
    leverList: document.getElementById('lever-list'),
    inventoryGrid: document.getElementById('inventory-grid'),
    inferenceGrid: document.getElementById('inference-grid'),
    inferenceCount: document.getElementById('inference-count'),
    dossierFields: document.getElementById('dossier-fields'),
    profilePercent: document.getElementById('profile-percent'),
    attentionPill: document.getElementById('attention-pill'),
    attentionFill: document.getElementById('attention-fill'),
    hotspotName: document.getElementById('hotspot-name'),
    hotspotDesc: document.getElementById('hotspot-desc'),
    distractionList: document.getElementById('distraction-list'),
    distractionPill: document.getElementById('distraction-pill'),
    regulatorLabel: document.getElementById('regulator-label'),
    regulatorBar: document.getElementById('regulator-bar'),
    pressLabel: document.getElementById('press-label'),
    pressBar: document.getElementById('press-bar'),
    pressureSummary: document.getElementById('pressure-summary'),
    eventFeed: document.getElementById('event-feed'),
    toast: document.getElementById('toast'),
    resultPanel: document.getElementById('result-panel'),
    resultBadge: document.getElementById('result-badge'),
    resultTitle: document.getElementById('result-title'),
    resultSummary: document.getElementById('result-summary'),
    resultDossier: document.getElementById('result-dossier'),
    restartButton: document.getElementById('restart-button'),
    pauseButton: document.getElementById('pause-button'),
    tokenLayer: document.getElementById('token-layer')
  };

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.floor(value));
  }

  function formatMoney(value) {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(0) + 'K';
    return '$' + Math.floor(value);
  }

  function pushEvent(text) {
    state.events.unshift({ time: `${String(Math.floor(state.seconds / 60)).padStart(2, '0')}:${String(state.seconds % 60).padStart(2, '0')}`, text });
    state.events = state.events.slice(0, 8);
    renderEvents();
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function spawnToken(fromSelector, toSelector) {
    const from = document.querySelector(fromSelector);
    const to = document.querySelector(toSelector);
    if (!from || !to) return;

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const token = document.createElement('div');
    token.className = 'token';
    token.textContent = '◉';

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    token.style.left = `${startX}px`;
    token.style.top = `${startY}px`;
    token.style.setProperty('--dx', `${(endX - startX).toFixed(1)}px`);
    token.style.setProperty('--dy', `${(endY - startY).toFixed(1)}px`);

    els.tokenLayer.appendChild(token);
    setTimeout(() => token.remove(), 1150);
  }

  function getCurrentRates() {
    const activeLevers = levers.filter(item => state.active.has(item.id));
    const multiplier = [...state.unlocked].reduce((total, id) => {
      const inf = inferences.find(item => item.id === id);
      return total * (inf ? inf.boost : 1);
    }, 1);

    return {
      users: activeLevers.reduce((total, lever) => total + lever.rate * 155, 0),
      revenue: activeLevers.reduce((total, lever) => total + lever.rate, 0) * 1e7 * multiplier
    };
  }

  function inferenceReady(inference) {
    return inference.recipe.every(([key, amount]) => state.inventory[key] >= amount);
  }

  function recipeLabel(inference) {
    return inference.recipe.map(([key, amount]) => `${dataDefs[key].emoji} ${amount}`).join(' + ');
  }

  function renderLevers() {
    els.leverList.innerHTML = '';

    levers.forEach(lever => {
      const active = state.active.has(lever.id);
      const card = document.createElement('article');
      card.className = `lever-card ${active ? 'active' : ''}`;
      card.dataset.id = lever.id;

      card.innerHTML = `
        <div class="lever-top">
          <div class="lever-icon">${lever.icon}</div>
          <div class="lever-copy">
            <h4>${lever.name}</h4>
            <p>${lever.copy}</p>
          </div>
          <button class="toggle" data-id="${lever.id}" aria-label="${active ? 'Turn off' : 'Turn on'} ${lever.name}"></button>
        </div>
        <div class="lever-bottom">
          <span class="yield">+${formatMoney(lever.rate * 1e6)}/s</span>
          <span class="risk">+${lever.risk.toFixed(2)} A/s</span>
        </div>
      `;

      const button = card.querySelector('.toggle');
      button.addEventListener('click', () => toggleLever(lever.id));

      els.leverList.appendChild(card);
    });

    els.activeCount.textContent = `${state.active.size} active`;
  }

  function renderInventory() {
    els.inventoryGrid.innerHTML = '';

    Object.entries(dataDefs).forEach(([key, meta]) => {
      const fillPercent = Math.min(100, (state.inventory[key] / 40) * 100);
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.innerHTML = `
        <div class="jar">
          <div class="jar-fill" style="height:${fillPercent}%"></div>
          <div class="jar-emoji">${meta.emoji}</div>
        </div>
        <div class="inventory-value">${formatNumber(state.inventory[key])}</div>
        <div class="inventory-label">${meta.label}</div>
      `;
      slot.querySelector('.jar').setAttribute('data-jar', key);
      els.inventoryGrid.appendChild(slot);
    });
  }

  function renderInferences() {
    els.inferenceGrid.innerHTML = '';

    inferences.forEach(inference => {
      const ready = inferenceReady(inference);
      const unlocked = state.unlocked.has(inference.id);

      const card = document.createElement('article');
      card.className = `inference-card ${unlocked ? 'unlocked' : ready ? 'ready' : 'locked'}`;

      if (unlocked) {
        card.innerHTML = `
          <div class="inference-head"><span>${inference.emoji}</span><span>Learned</span></div>
          <div class="inference-name">${inference.name}</div>
          <div class="inference-recipe">${inference.text}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="inference-head"><span>${inference.emoji}</span><span>${ready ? 'Ready' : 'Locked'}</span></div>
          <div class="inference-name">${inference.name}</div>
          <div class="inference-recipe">${recipeLabel(inference)}</div>
          <button class="inference-button ${ready ? 'ready' : ''}" ${ready ? '' : 'disabled'}>Learn</button>
        `;
        const button = card.querySelector('.inference-button');
        if (button && ready) {
          button.addEventListener('click', () => craftInference(inference.id));
        }
      }

      els.inferenceGrid.appendChild(card);
    });

    els.inferenceCount.textContent = `${state.unlocked.size} / ${inferences.length}`;
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
          ${value || '— — —'}
          ${value && state.wrong.has(key) ? '<span class=\"low-confidence\">Low confidence • model output</span>' : ''}
        </div>
      `;
      els.dossierFields.appendChild(row);
    });

    els.profilePercent.textContent = `${Math.round((state.unlocked.size / inferences.length) * 100)}%`;
  }

  function renderEvents() {
    els.eventFeed.innerHTML = '';

    state.events.forEach(event => {
      const row = document.createElement('div');
      row.className = 'event-item';
      row.innerHTML = `<strong>${event.time}</strong> ${event.text}`;
      els.eventFeed.appendChild(row);
    });
  }

  function determineHotspot() {
    const activeLevers = [...state.active];
    if (!activeLevers.length) {
      state.hotspot = { name: 'No current spike', desc: 'The platform is quiet.' };
      return;
    }

    const selectedId = activeLevers[Math.floor(Math.random() * activeLevers.length)];
    const selectedLever = levers.find(item => item.id === selectedId);

    state.hotspot = {
      name: selectedLever ? selectedLever.name : 'Hot topic',
      desc: selectedLever ? `${selectedLever.name} is drawing unusual attention.` : 'A notable cluster is forming.',
      targetKey: selectedLever ? selectedLever.data : 'search'
    };
  }

  function renderAttention() {
    const label = state.attention >= 70 ? 'CRITICAL' : state.attention >= 35 ? 'WATCH' : 'LOW';
    els.attentionPill.textContent = label;

    els.attentionFill.style.width = `${Math.min(100, state.attention)}%`;

    if (!state.hotspot) {
      state.hotspot = { name: 'No current spike', desc: 'The platform is quiet.' };
    }

    els.hotspotName.textContent = state.hotspot.name;
    els.hotspotDesc.textContent = state.hotspot.desc;
  }

  function renderDistractions() {
    els.distractionList.innerHTML = '';

    distractions.forEach(distraction => {
      const disabled = state.ended || state.distractionCooldowns[distraction.id] > 0 || state.activeDistraction?.id === distraction.id;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'distraction-option';
      option.disabled = disabled;

      option.innerHTML = `
        <span class=\"distraction-icon\">${distraction.icon}</span>
        <span class=\"distraction-copy\">
          <strong>${distraction.label}</strong>
          <small>${distraction.description}</small>
        </span>
        <span class=\"distraction-cooldown\">${state.distractionCooldowns[distraction.id] > 0 ? `${state.distractionCooldowns[distraction.id]}s` : 'Ready'}</span>
      `;

      option.addEventListener('click', () => fireDistraction(distraction.id));
      els.distractionList.appendChild(option);
    });

    if (state.activeDistraction) {
      els.distractionPill.textContent = `${state.activeDistraction.label} • ${Math.ceil(state.activeDistraction.remaining)}s`;
    } else {
      els.distractionPill.textContent = 'Ready';
    }
  }

  function renderPressure() {
    const regulatorWidth = Math.min(100, (state.awareness / 60) * 100);
    const pressWidth = Math.min(100, state.press);

    els.regulatorBar.style.width = `${regulatorWidth}%`;
    els.pressBar.style.width = `${pressWidth}%`;

    els.regulatorLabel.textContent = state.regulatorFired ? (state.regulatorCooldown > 0 ? 'Active' : 'Cooled') : 'Dormant';
    els.pressLabel.textContent = state.press >= 70 ? 'Publishing' : state.press >= 35 ? 'Asking' : 'Quiet';

    if (state.regulatorFired && state.regulatorCooldown > 0) {
      els.pressureSummary.textContent = `Investigation filed. ${Math.ceil(state.regulatorCooldown)}s before the heat breaks.`;
    } else if (state.press >= 70) {
      els.pressureSummary.textContent = 'The press is moving. A story is gathering momentum.';
    } else if (state.attention >= 35) {
      els.pressureSummary.textContent = 'Attention is beginning to concentrate. Something will need to be shown to it.';
    } else {
      els.pressureSummary.textContent = 'No one is watching yet.';
    }
  }

  function renderStats() {
    const rates = getCurrentRates();
    const remaining = Math.max(0, RUN_SECONDS - state.seconds);

    els.clock.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    els.usersValue.textContent = formatNumber(state.users);
    els.usersRate.textContent = `+${formatNumber(rates.users)}/sec`;
    els.revenueValue.textContent = formatMoney(state.revenue);
    els.revenueRate.textContent = `+$${formatNumber(rates.revenue)}/sec`;
    els.revenueBar.style.width = `${Math.min(100, (state.revenue / TARGET_REVENUE) * 100)}%`;
    els.awarenessValue.textContent = Math.floor(state.awareness);

    const status = state.awareness >= 60 ? 'high' : state.awareness >= 35 ? 'rising' : 'low';
    els.awarenessStatus.className = `status-pill ${status}`;
    els.awarenessStatus.textContent = state.awareness >= 60 ? 'ELEVATED' : state.awareness >= 35 ? 'RISING' : 'LOW';
    els.awarenessBar.style.width = `${Math.min(100, state.awareness)}%`;
  }

  function renderInstructionBox() {
    const steps = tutorialSteps;
    const step = steps[Math.min(state.boardStep, steps.length - 1)];
    els.instructionBox.innerHTML = step;
  }

  function renderAll() {
    renderStats();
    renderInstructionBox();
    renderLevers();
    renderInventory();
    renderInferences();
    renderDossier();
    renderAttention();
    renderDistractions();
    renderPressure();
    renderEvents();
  }

  function toggleLever(id) {
    if (state.ended) return;

    const lever = levers.find(item => item.id === id);
    if (!lever) return;

    if (state.active.has(id)) {
      state.active.delete(id);
      pushEvent(`<strong>${lever.name}</strong> paused.`);
    } else {
      state.active.add(id);
      pushEvent(`<strong>${lever.name}</strong> deployed. ${dataDefs[lever.data].label} collection started.`);
      spawnToken(`.lever-card[data-id="${id}"] .lever-icon`, `.inventory-slot .jar[data-jar="${lever.data}"]`);
      if (state.boardStep === 0) state.boardStep = 1;
    }

    renderAll();
  }

  function craftInference(id) {
    const inference = inferences.find(item => item.id === id);
    if (!inference || state.ended) return;
    if (state.unlocked.has(id)) return;

    const ready = inferenceReady(inference);
    if (!ready) return;

    inference.recipe.forEach(([key, amount]) => {
      state.inventory[key] -= amount;
    });

    state.unlocked.add(id);

    if (inference.field) {
      state.dossier[inference.field] = inference.text;
    }
    if (inference.wrong) {
      state.wrong.add(inference.field);
    }

    pushEvent(`<strong>${inference.name}</strong> learned. ${inference.text}`);
    showToast(`${inference.name} learned`);
    if (state.boardStep < tutorialSteps.length - 1) state.boardStep += 1;

    renderAll();
  }

  function fireDistraction(id) {
    const config = distractions.find(item => item.id === id);
    if (!config || state.ended) return;
    if (state.distractionCooldowns[id] > 0) return;

    state.distractionCooldowns[id] = config.cooldown;

    state.attention = Math.max(0, state.attention - config.reduction);
    if (state.hotspot && state.hotspot.targetKey) {
      state.hotspot.name = `${config.label} deployed`;
      state.hotspot.desc = `Attention is being redirected away from ${dataDefs[state.hotspot.targetKey].label.toLowerCase()}.`;
    }

    if (config.id === 'trend') {
      state.activeDistraction = { id: config.id, label: config.label, remaining: config.duration };
      pushEvent('<strong>Viral trend launched.</strong> It spreads wide and harvests while it runs.');
    } else if (config.id === 'scandal') {
      state.users = Math.max(0, state.users - 600);
      pushEvent('<strong>Rival scandal.</strong> Attention shifts away from your own platform.');
    } else if (config.id === 'outrage') {
      state.users = Math.max(0, state.users - 1200);
      pushEvent('<strong>Outrage topic.</strong> The user base turns hostile.');
    } else if (config.id === 'launch') {
      state.revenue = Math.max(0, state.revenue - 400_000_000);
      pushEvent('<strong>Feature launch.</strong> You bought back attention with a roadmap slot.');
    }

    showToast(`${config.label} fired`);
    renderAll();
  }

  function tickDistraction() {
    if (!state.activeDistraction) return;

    state.activeDistraction.remaining -= 1;

    if (state.activeDistraction.id === 'trend') {
      const target = state.hotspot && state.hotspot.targetKey ? state.hotspot.targetKey : 'search';
      state.inventory[target] += 1;
      const jarSelector = `.inventory-slot .jar[data-jar="${target}"]`;
      spawnToken('.hotspot-name', jarSelector);
    }

    if (state.activeDistraction.remaining <= 0) {
      state.activeDistraction = null;
      pushEvent('<strong>Distraction expired.</strong> Attention settles again.');
    }
  }

  function stepGame() {
    if (!state.started || state.paused || state.ended) return;

    state.seconds += 1;

    const rates = getCurrentRates();
    state.users += rates.users;
    state.revenue += rates.revenue;

    // inventory harvest
    levers.forEach(lever => {
      if (state.active.has(lever.id)) {
        state.inventory[lever.data] += 1;
        const jarSelector = `.inventory-slot .jar[data-jar="${lever.data}"]`;
        spawnToken(`.lever-card[data-id="${lever.id}"] .lever-icon`, jarSelector);
      }
    });

    let awarenessRate = 0.04 + levers.filter(lever => state.active.has(lever.id)).reduce((sum, lever) => sum + lever.risk, 0);
    if (state.privacy > 0) {
      awarenessRate = 0;
      state.privacy -= 1;
    }
    state.awareness += awarenessRate;

    state.attention += 0.4 + state.active.size * 0.25;
    if (state.attention > 100) state.attention = 100;

    state.press += 0.1 + state.active.size * 0.05;
    if (state.press >= 100) {
      state.press = 0;
      state.awareness += 15;
      pushEvent('<strong>Press inquiry published.</strong> Public awareness rises by 15.');
      showToast('Press story broke. Awareness +15');
    }

    if (!state.hotspot || state.seconds % 16 === 0) {
      determineHotspot();
    }

    if (state.awareness >= 60 && !state.regulatorFired) {
      state.regulatorFired = true;
      state.regulatorCooldown = 30;

      const activeKeys = [...state.active];
      if (activeKeys.length) {
        const target = activeKeys[Math.floor(Math.random() * activeKeys.length)];
        state.active.delete(target);
        state.forcedOff = target;
        pushEvent(`<strong>Regulator investigation.</strong> ${levers.find(item => item.id === target)?.name || 'A lever'} suspended for 30 seconds.`);
        showToast('Investigation filed. One lever offline.');
      }
    }

    if (state.forcedOff) {
      state.regulatorCooldown -= 1;
      if (state.regulatorCooldown <= 0) {
        state.forcedOff = null;
        pushEvent('<strong>Regulatory hold lifted.</strong> The suspended lever returns.');
      }
    }

    Object.keys(state.distractionCooldowns).forEach(id => {
      if (state.distractionCooldowns[id] > 0) {
        state.distractionCooldowns[id] -= 1;
      }
    });

    tickDistraction();

    if (state.revenue >= TARGET_REVENUE) {
      endGame(true);
      return;
    }

    if (state.awareness >= 100) {
      endGame(false);
      return;
    }

    if (state.seconds >= RUN_SECONDS) {
      endGame(false, true);
      return;
    }

    renderAll();
  }

  function endGame(won, timedOut = false) {
    state.ended = true;
    state.paused = false;

    const badge = won ? 'SUCCESS' : timedOut ? 'TIME UP' : 'DELETED';
    const title = won
      ? 'Maya is a market now.'
      : timedOut
        ? 'The quarter ended before the story landed.'
        : 'The platform was emptied.';

    const summary = won
      ? 'The $100B valuation was reached. Here is the completed dossier on Maya Quinn. Some entries are wrong. The model still performed.'
      : timedOut
        ? 'The quarter ended before target valuation. Here is what the system learned before the clock ran out.'
        : 'Awareness reached 100. Users left in bulk, the platform collapsed, and this is what remained of Maya’s profile.';

    els.resultBadge.textContent = badge;
    els.resultTitle.textContent = title;
    els.resultSummary.textContent = summary;

    els.resultDossier.innerHTML = '';
    Object.entries(fieldLabels).forEach(([key, label]) => {
      const value = state.dossier[key];
      const row = document.createElement('div');
      row.className = 'dossier-row';
      row.innerHTML = `
        <div class="dossier-key">${label}</div>
        <div class="dossier-value ${value ? (state.wrong.has(key) ? 'wrong' : '') : 'empty'}">
          ${value || '— — —'}
          ${value && state.wrong.has(key) ? '<span class=\"low-confidence\">Low confidence • model output</span>' : ''}
        </div>
      `;
      els.resultDossier.appendChild(row);
    });

    els.resultPanel.classList.remove('hidden');
    renderAll();
  }

  function resetState() {
    Object.assign(state, {
      started: false,
      paused: false,
      ended: false,
      seconds: 0,
      users: 10000,
      revenue: 0,
      awareness: 8,
      attention: 0,
      inventory: Object.fromEntries(Object.keys(dataDefs).map(key => [key, 0])),
      active: new Set(),
      unlocked: new Set(),
      dossier: {},
      wrong: new Set(),
      events: [],
      boardStep: 0,
      regulatorFired: false,
      regulatorCooldown: 0,
      forcedOff: null,
      press: 0,
      hotspot: null,
      activeDistraction: null,
      distractionCooldowns: Object.fromEntries(distractions.map(item => [item.id, 0])),
      privacy: 0,
      lobbying: 0,
      rebrandUsed: false
    });

    els.resultPanel.classList.add('hidden');
    renderAll();
  }

  function startGame() {
    state.started = true;
    state.paused = false;
    state.ended = false;
    pushEvent('<strong>Quarter initialized.</strong> Five files are active. Ten thousand users are live.');
    showToast('Quarter live');
    renderAll();
  }

  function init() {
    renderAll();
    els.pauseButton.addEventListener('click', () => {
      if (!state.started || state.ended) return;
      state.paused = !state.paused;
      els.pauseButton.textContent = state.paused ? '▶' : 'II';
      showToast(state.paused ? 'Paused' : 'Running');
    });

    els.restartButton.addEventListener('click', () => {
      resetState();
      startGame();
    });

    setInterval(stepGame, 1000);
  }

  init();
  startGame();
})();
