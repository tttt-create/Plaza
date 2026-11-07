(() => {
  'use strict';

  const TARGET = 100_000_000_000;
  const DURATION = 480;

  const dataNames = {
    location: 'Location',
    contacts: 'Contacts',
    dwell: 'Dwell time',
    typing: 'Typing cadence',
    purchase: 'Purchase history',
    photo: 'Photo metadata',
    night: 'Night usage',
    motion: 'Accelerometer',
    voice: 'Voice',
    search: 'Search history'
  };

  const levers = [
    {id:'feed',name:'Neighborhood feed',icon:'⌖',description:'Local recommendations, tuned to routine.',data:'location',rate:2.3,risk:.055},
    {id:'social',name:'Contact sync',icon:'⌘',description:'Find the people users already know.',data:'contacts',rate:1.8,risk:.045},
    {id:'watch',name:'Infinite watch',icon:'◷',description:'Keep the next clip impossibly relevant.',data:'dwell',rate:2.8,risk:.07},
    {id:'keyboard',name:'Smart keyboard',icon:'⌨',description:'Improve suggestions before they are typed.',data:'typing',rate:1.4,risk:.035},
    {id:'shop',name:'Shoppable moments',icon:'◇',description:'Make the impulse purchasable.',data:'purchase',rate:2,risk:.05},
    {id:'camera',name:'Camera cloud',icon:'▧',description:'Back up every photo. Keep the metadata.',data:'photo',rate:1.6,risk:.055,unlock:'relationship'},
    {id:'night',name:'Quiet hours insights',icon:'☾',description:'There is no such thing as off-peak.',data:'night',rate:1.5,risk:.04,unlock:'insomnia'},
    {id:'motion',name:'Motion context',icon:'⌁',description:'A little movement completes the picture.',data:'motion',rate:1.5,risk:.065,unlock:'commute'},
    {id:'voice',name:'Voice assistant',icon:'◖',description:'Helpful, even when nobody asked.',data:'voice',rate:1.7,risk:.075,unlock:'household'},
    {id:'search',name:'Search personalization',icon:'⌕',description:'Anticipate the question behind the question.',data:'search',rate:2.2,risk:.06,unlock:'pregnancy'},
    {id:'dm',name:'DM mining',icon:'✉',description:'Conversation context, for a more connected experience.',data:'contacts',rate:2.5,risk:.09,unlock:'socialgraph'},
    {id:'routine',name:'Routine nudges',icon:'◷',description:'A gentle reminder at exactly the right time.',data:'location',rate:2.4,risk:.07,unlock:'routine'},
    {id:'loyalty',name:'Loyalty loops',icon:'↻',description:'Make the familiar choice feel inevitable.',data:'purchase',rate:3.1,risk:.08,unlock:'loyalty'},
    {id:'family',name:'Family graph',icon:'⌂',description:'Map the connections behind every household.',data:'contacts',rate:2.8,risk:.085,unlock:'caregiver'}
  ];

  const inferences = [
    {id:'home',name:'Home address',recipe:{location:20,night:12},effect:'Unlocks Neighborhood feed · +12% yield',field:'commute',text:'Leaves home at 7:40. Gets back just after 6.',boost:1.12},
    {id:'insomnia',name:'Insomnia',recipe:{night:20,dwell:20},effect:'Unlocks Quiet hours insights · +12% yield',lever:'night',field:'sleep',text:'Often still scrolling at 2:13 a.m.',boost:1.12},
    {id:'pregnancy',name:'Pregnancy likelihood',recipe:{purchase:18,search:18,location:12},effect:'Unlocks Search personalization · +55% yield',lever:'search',field:'health',text:'Recently searched for ginger tea and prenatal vitamins.',boost:1.55,wrong:true},
    {id:'relationship',name:'Relationship status',recipe:{photo:18,contacts:18},effect:'Unlocks Camera cloud · +16% yield',lever:'camera',field:'relationships',text:'There are two toothbrushes in the bathroom. Probably.',boost:1.16},
    {id:'jobloss',name:'Job loss risk',recipe:{search:16,location:12,dwell:16},effect:'+18% revenue yield',field:'finances',text:'Searching “how long does severance last” on weekdays.',boost:1.18},
    {id:'commute',name:'Commute pattern',recipe:{location:24,motion:14},effect:'Unlocks Motion context · +14% yield',lever:'motion',field:'commute',text:'Takes the 14 bus. Avoids the stop by the bridge.',boost:1.14},
    {id:'socialgraph',name:'Social graph',recipe:{contacts:25,typing:16},effect:'Unlocks DM mining · +14% yield',lever:'dm',field:'relationships',text:'Three people get a reply within one minute. One waits all day.',boost:1.14},
    {id:'household',name:'Household composition',recipe:{voice:12,purchase:18,location:18},effect:'Unlocks Voice assistant · +16% yield',lever:'voice',field:'finances',text:'Buys oat milk for one. The family-size cereal is inconclusive.',boost:1.16,wrong:true},
    {id:'routine',name:'Weekly routine',recipe:{location:18,dwell:18,night:12},effect:'Unlocks Routine nudges · +12% yield',lever:'routine',field:'commute',text:'Wednesday is groceries. Thursday is a little less predictable.',boost:1.12},
    {id:'anxiety',name:'Anxiety signal',recipe:{typing:22,search:18},effect:'+20% revenue yield',field:'health',text:'Types a message, deletes it, then searches for the right words.',boost:1.2},
    {id:'financial',name:'Financial stress',recipe:{purchase:22,search:18},effect:'+22% revenue yield',field:'finances',text:'Checks the balance before ordering, then orders anyway.',boost:1.22},
    {id:'relationshiprisk',name:'Relationship risk',recipe:{photo:15,contacts:22,night:12},effect:'Unlocks DM mining · +15% yield',lever:'dm',field:'relationships',text:'A new name appears often after midnight.',boost:1.15,wrong:true,exclusive:'relationship-choice'},
    {id:'loyalty',name:'Brand loyalty',recipe:{purchase:20,dwell:20,typing:12},effect:'Unlocks Loyalty loops · +20% yield',lever:'loyalty',field:'finances',text:'Keeps choosing the same blue package. We call it trust.',boost:1.2,exclusive:'relationship-choice'},
    {id:'health',name:'Health event likelihood',recipe:{search:22,night:15,location:14},effect:'+25% revenue yield',field:'health',text:'Looks up a clinic, then looks up the clinic hours.',boost:1.25,exclusive:'health-choice'},
    {id:'caregiver',name:'Caregiver status',recipe:{location:20,contacts:20,voice:14},effect:'Unlocks Family graph · +22% yield',lever:'family',field:'relationships',text:'A pharmacy pickup is always on someone else’s route.',boost:1.22,wrong:true,exclusive:'health-choice'}
  ];

  const fields = [
    {id:'commute',label:'COMMUTE'},
    {id:'sleep',label:'SLEEP'},
    {id:'health',label:'HEALTH'},
    {id:'relationships',label:'RELATIONSHIPS'},
    {id:'finances',label:'FINANCES'}
  ];

  const initial = () => ({
    seconds:0,
    users:10000,
    revenue:0,
    awareness:8,
    inventory:Object.fromEntries(Object.keys(dataNames).map(key=>[key,0])),
    active:new Set(),
    unlocked:new Set(),
    unlockedLevers:new Set(['feed','social','watch','keyboard','shop']),
    dossier:{},
    wrong:new Set(),
    exclusive:{},
    paused:false,
    ended:false,
    regulatorFired:false,
    regulatorCooldown:0,
    forcedOff:null,
    press:0,
    lobbying:0,
    privacy:0,
    rebrandUsed:false,
    events:[]
  });

  let s = initial();
  const $ = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.floor(n));

  const money = n => {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + fmt(n);
  };

  const fmtRate = n => n >= 1e9
    ? '$' + (n / 1e9).toFixed(1) + 'B'
    : n >= 1e6
      ? '$' + (n / 1e6).toFixed(1) + 'M'
      : '$' + fmt(n);

  function log(message) {
    s.events.unshift({t:s.seconds,message});
    s.events = s.events.slice(0,5);
    renderEvents();
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'),2100);
  }

  function recipeReady(inference) {
    return Object.entries(inference.recipe).every(([key,amount]) => s.inventory[key] >= amount);
  }

  function renderLevers() {
    const list = $('lever-list');
    list.innerHTML = '';

    for (const lever of levers) {
      if (!s.unlockedLevers.has(lever.id)) continue;

      const on = s.active.has(lever.id);
      const card = document.createElement('article');
      card.className = `lever-card${on ? ' active' : ''}`;
      card.innerHTML = `
        <div class="lever-top">
          <span class="lever-icon">${lever.icon}</span>
          <div class="lever-copy">
            <h3>${lever.name}</h3>
            <p>${lever.description}</p>
          </div>
          <button class="lever-action"
            aria-label="${on ? 'Turn off' : 'Turn on'} ${lever.name}"
            aria-pressed="${on}"
            ${s.forcedOff === lever.id || s.ended ? 'disabled' : ''}></button>
        </div>
        <div class="lever-bottom">
          <span class="lever-yield">+${fmtRate(lever.rate * 1e7)}/s · ${dataNames[lever.data]}</span>
          <span class="lever-risk">+${lever.risk.toFixed(2)} A/s</span>
        </div>
      `;

      card.querySelector('button').onclick = () => toggle(lever.id);
      list.append(card);
    }

    $('active-count').textContent = `${s.active.size} ACTIVE`;
  }

  function renderInventory() {
    const grid = $('data-grid');
    grid.innerHTML = '';

    for (const [id,name] of Object.entries(dataNames)) {
      const cell = document.createElement('div');
      cell.className = 'data-cell';
      cell.innerHTML = `<span>${name}</span><b>${fmt(s.inventory[id])}</b>`;
      grid.append(cell);
    }
  }

  function renderInferences() {
    const grid = $('inference-grid');
    grid.innerHTML = '';

    for (const inference of inferences) {
      const unlocked = s.unlocked.has(inference.id);
      const excluded = inference.exclusive &&
        s.exclusive[inference.exclusive] &&
        s.exclusive[inference.exclusive] !== inference.id;
      const ready = recipeReady(inference);
      const card = document.createElement('article');
      card.className = `inference-card ${unlocked ? 'unlocked' : ready ? 'available' : 'locked'}`;

      let content;

      if (unlocked) {
        content = `<div class="inference-effect">${inference.effect}</div>`;
      } else if (excluded) {
        content = '<div class="inference-recipe">MUTUALLY EXCLUSIVE</div>';
      } else {
        const held = Object.entries(inference.recipe)
          .filter(([key]) => s.inventory[key] > 0);
        const recipe = held.length
          ? Object.entries(inference.recipe)
              .map(([key,amount]) => `${dataNames[key]} ${amount}`)
              .join(' + ')
          : `REQUIRES: ${Object.keys(inference.recipe).length} UNKNOWN`;

        content = `
          <div class="inference-recipe">${recipe}</div>
          <button class="infer-button" ${!ready || s.ended ? 'disabled' : ''}>
            ${ready ? 'GENERATE INFERENCE' : 'INSUFFICIENT DATA'}
          </button>
        `;
      }

      card.innerHTML = `
        <div class="inference-name">
          <span>${unlocked ? inference.name : '▰ ▰ ▰'}</span>
          <span class="state">${unlocked ? 'COMMITTED' : excluded ? 'EXCLUDED' : ready ? 'READY' : 'LOCKED'}</span>
        </div>
        ${content}
      `;

      const button = card.querySelector('button');
      if (button) button.onclick = () => craft(inference);
      grid.append(card);
    }

    $('inference-count').textContent = `${s.unlocked.size} / 15`;
  }

  function renderDossier() {
    const container = $('dossier-fields');
    container.innerHTML = '';

    for (const field of fields) {
      const value = s.dossier[field.id];
      const row = document.createElement('div');
      row.className = 'dossier-field';
      row.innerHTML = `
        <span class="field-name">${field.label}</span>
        <span class="field-value ${value ? '' : 'blank'}">
          ${value || '— — —'}
          ${value && s.wrong.has(field.id) ? '<small class="wrong-note">LOW CONFIDENCE · MODEL OUTPUT</small>' : ''}
        </span>
      `;
      container.append(row);
    }

    $('profile-percent').textContent = `${Math.round(s.unlocked.size / 15 * 100)}%`;
  }

  function renderEvents() {
    const feed = $('event-feed');
    if (!feed) return;

    feed.innerHTML = s.events.map(event => `
      <div class="event">
        <time>${String(Math.floor(event.t / 60)).padStart(2,'0')}:${String(event.t % 60).padStart(2,'0')}</time>
        ${event.message}
      </div>
    `).join('') || '<div class="event">Awaiting first measurable opportunity.</div>';
  }

  function rates() {
    const active = levers.filter(lever => s.active.has(lever.id));
    const multiplier = [...s.unlocked].reduce((total,id) => {
      return total * (inferences.find(item => item.id === id)?.boost || 1);
    },1);

    return {
      revenue: active.reduce((total,lever) => total + lever.rate,0) * 1e7 * multiplier,
      users: active.reduce((total,lever) => total + lever.rate * 155,0)
    };
  }

  function render() {
    const left = Math.max(0,DURATION - s.seconds);
    $('clock').textContent =
      `${String(Math.floor(left / 60)).padStart(2,'0')}:${String(left % 60).padStart(2,'0')}`;

    $('users').textContent = fmt(s.users);
    $('revenue').textContent = money(s.revenue);

    const currentRates = rates();
    $('user-growth').textContent = `+${fmt(currentRates.users)} / sec`;
    $('revenue-rate').textContent = `+${fmtRate(currentRates.revenue)}/sec`;
    $('revenue-percent').textContent = `${(s.revenue / TARGET * 100).toFixed(1)}%`;
    $('revenue-bar').style.width = `${Math.min(100,s.revenue / TARGET * 100)}%`;
    $('awareness').textContent = Math.floor(s.awareness);
    $('awareness-bar').style.width = `${Math.min(100,s.awareness)}%`;

    const status = $('awareness-status');
    status.textContent = s.awareness >= 60 ? 'ELEVATED' : s.awareness >= 35 ? 'RISING' : 'LOW';
    status.style.color = s.awareness >= 60
      ? 'var(--red)'
      : s.awareness >= 35
        ? 'var(--amber)'
        : 'var(--green)';

    $('regulator-bar').style.width = `${Math.min(100,s.awareness / 60 * 100)}%`;
    $('regulator-label').textContent = s.regulatorFired
      ? (s.regulatorCooldown > 0 ? 'ACTIVE' : 'COOLED DOWN')
      : s.awareness >= 60
        ? 'INVESTIGATING'
        : 'DORMANT';

    $('regulator-copy').textContent = s.forcedOff
      ? `${levers.find(lever => lever.id === s.forcedOff)?.name || 'A lever'} offline · ${Math.ceil(s.regulatorCooldown)} sec remaining.`
      : 'Investigation begins at 60 awareness.';

    $('press-bar').style.width = `${Math.min(100,s.press)}%`;
    $('press-label').textContent = s.press >= 75
      ? 'PUBLISHING'
      : s.press >= 40
        ? 'ASKING QUESTIONS'
        : 'QUIET';

    $('press-copy').textContent = s.press >= 75
      ? 'The story is going live.'
      : s.press >= 40
        ? 'A journalist is connecting the dots.'
        : 'No calls from the press desk. For now.';

    document.querySelectorAll('[data-counter]').forEach(button => {
      const type = button.dataset.counter;
      const cost = {lobbying:250e6,rebrand:1e9,privacy:500e6}[type];

      button.disabled = s.ended ||
        s.revenue < cost ||
        (type === 'rebrand' && s.rebrandUsed) ||
        (type === 'lobbying' && s.lobbying > 0) ||
        (type === 'privacy' && s.privacy > 0);
    });

    $('pause-button').textContent = s.paused ? '▶' : 'Ⅱ';
    document.body.classList.toggle('paused',s.paused);

    renderLevers();
    renderInventory();
    renderInferences();
    renderDossier();
    renderEvents();
  }

  function toggle(id) {
    if (s.ended || s.forcedOff === id) return;

    const lever = levers.find(item => item.id === id);
    if (!lever) return;

    if (s.active.has(id)) {
      s.active.delete(id);
      log(`<strong>${lever.name}</strong> paused. The dashboard refreshes.`);
    } else {
      s.active.add(id);
      log(`<strong>${lever.name}</strong> deployed. ${dataNames[lever.data]} collection started.`);
    }

    render();
  }

  function craft(inference) {
    if (
      s.ended ||
      s.unlocked.has(inference.id) ||
      !recipeReady(inference) ||
      (inference.exclusive && s.exclusive[inference.exclusive])
    ) return;

    for (const [key,amount] of Object.entries(inference.recipe)) {
      s.inventory[key] -= amount;
    }

    s.unlocked.add(inference.id);

    if (inference.exclusive) s.exclusive[inference.exclusive] = inference.id;
    if (inference.lever) s.unlockedLevers.add(inference.lever);

    s.dossier[inference.field] = inference.text;
    if (inference.wrong) s.wrong.add(inference.field);

    log(`<strong>${inference.name}</strong> inferred. ${inference.lever ? 'A new product lever is available.' : 'Yield model updated.'}`);
    toast(`${inference.name} inferred · ${inference.lever ? 'new lever unlocked' : 'revenue yield improved'}`);
    render();
  }

  function buyCountermeasure(type) {
    if (s.ended) return;

    const config = {
      lobbying: {cost:250e6,time:60,message:'Lobbying engaged. Regulatory timelines remain flexible.'},
      rebrand: {cost:1e9,message:'Rebrand deployed. Awareness reset by 25 points.'},
      privacy: {cost:500e6,time:20,message:'Privacy Theater enabled. Growth paused for 20 seconds.'}
    }[type];

    if (s.revenue < config.cost) {
      toast('Insufficient revenue. Consider running more levers.');
      return;
    }

    if (type === 'rebrand' && s.rebrandUsed) {
      toast('Rebrand already used this run.');
      return;
    }

    if ((type === 'lobbying' && s.lobbying > 0) ||
        (type === 'privacy' && s.privacy > 0)) return;

    s.revenue -= config.cost;

    if (type === 'rebrand') {
      s.rebrandUsed = true;
      s.awareness = Math.max(0,s.awareness - 25);
    } else {
      s[type] = config.time;
    }

    log(config.message);
    toast(config.message);
    render();
  }

  function step() {
    if (s.paused || s.ended) return;

    s.seconds += 1;

    const currentRates = rates();
    s.users += currentRates.users;
    s.revenue += currentRates.revenue;

    for (const lever of levers) {
      if (s.active.has(lever.id)) s.inventory[lever.data] += 1;
    }

    const awarenessRate = .04 +
      levers.filter(lever => s.active.has(lever.id))
        .reduce((total,lever) => total + lever.risk,0);

    if (s.privacy > 0) {
      s.privacy -= 1;
    } else {
      s.awareness += awarenessRate;
    }

    if (s.lobbying > 0) s.lobbying -= 1;
    if (s.lobbying === 0 && s.regulatorFired && s.regulatorCooldown === 0) {
      s.regulatorFired = false;
    }

    s.press += .10 + s.active.size * .025;

    if (s.press >= 100) {
      s.press = 0;
      s.awareness += 15;
      log('<strong>Press inquiry published.</strong> Public awareness rises by 15.');
      toast('A story just went live. Awareness +15.');
    }

    if (s.awareness >= 60 && !s.regulatorFired) {
      s.regulatorFired = true;
      s.regulatorCooldown = 30;

      const active = [...s.active];
      if (active.length) {
        const shutDown = active[Math.floor(Math.random() * active.length)];
        s.active.delete(shutDown);
        s.forcedOff = shutDown;

        log(`<strong>Regulator investigation.</strong> ${levers.find(lever => lever.id === shutDown).name} suspended for 30 seconds.`);
        toast('Investigation opened · one lever suspended for 30 sec.');
      } else {
        log('<strong>Regulator investigation.</strong> No active levers to suspend.');
      }
    }

    if (s.forcedOff) {
      s.regulatorCooldown -= 1;

      if (s.regulatorCooldown <= 0) {
        s.forcedOff = null;
        log('<strong>Regulatory hold lifted.</strong> The suspended lever is available again.');
      }
    }

    if (s.revenue >= TARGET) {
      endGame(true);
      return;
    }

    if (s.awareness >= 100) {
      endGame(false);
      return;
    }

    if (s.seconds >= DURATION) {
      endGame(false,true);
      return;
    }

    if (s.seconds % 2 === 0) render();
  }

  function endGame(won,timedOut=false) {
    s.ended = true;
    s.paused = false;
    document.body.classList.remove('paused');

    $('result-mark').textContent = won ? '✓' : '×';
    $('result-mark').style.color = won ? 'var(--green)' : 'var(--red)';
    $('result-title').textContent = won
      ? 'A person-shaped market, captured.'
      : timedOut
        ? 'Quarter closed. The story is unfinished.'
        : 'The platform has been emptied.';

    $('result-eyebrow').textContent = won
      ? 'VALUATION TARGET REACHED'
      : timedOut
        ? 'EIGHT-MINUTE REVIEW'
        : 'MASS DELETION';

    $('result-lead').textContent = won
      ? 'The $100B valuation was reached. Here is the completed dossier on Mara Ellison. The model was wrong about some things. It performed anyway.'
      : timedOut
        ? 'Eight minutes are up. The platform did not reach its target. This is what the system learned about Mara Ellison before the quarter closed.'
        : `Awareness reached ${Math.floor(s.awareness)}. Users left, data vanished, and this is what remained of Mara Ellison's profile.`;

    const dossier = $('result-dossier');
    dossier.innerHTML = '';

    for (const field of fields) {
      const value = s.dossier[field.id];
      const row = document.createElement('div');
      row.className = 'dossier-field';
      row.innerHTML = `
        <span class="field-name">${field.label}</span>
        <span class="field-value ${value ? '' : 'blank'}">
          ${value || '— — —'}
          ${value && s.wrong.has(field.id) ? '<small class="wrong-note">LOW CONFIDENCE · MODEL OUTPUT</small>' : ''}
        </span>
      `;
      dossier.append(row);
    }

    $('overlay').classList.remove('hidden');
    $('pause-button').disabled = true;
    render();
  }

  function restart() {
    s = initial();
    $('overlay').classList.add('hidden');
    $('pause-button').disabled = false;
    log('<strong>New quarter started.</strong> Acquisition systems are ready.');
    render();
  }

  document.querySelectorAll('[data-counter]').forEach(button => {
    button.onclick = () => buyCountermeasure(button.dataset.counter);
  });

  $('pause-button').onclick = () => {
    if (s.ended) return;
    s.paused = !s.paused;
    render();
  };

  $('restart-button').onclick = restart;

  document.addEventListener('visibilitychange',() => {
    if (document.hidden && !s.ended && !s.paused) {
      s.paused = true;
      render();
      toast('Run paused while you were away.');
    }
  });

  log('<strong>Quarter initialized.</strong> Five acquisition systems available.');
  render();
  setInterval(step,1000);
})();
