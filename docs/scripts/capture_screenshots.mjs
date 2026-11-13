import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('docs/screenshots', { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  '--window-size=1280,1400',
  'http://localhost:5173'
]);

// Wait 2.5s for chrome to initialize
await new Promise(r => setTimeout(r, 2500));

async function run() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  
  if (!pageTarget) {
    console.error('No page target found');
    chrome.kill();
    return;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`docs/screenshots/${filename}`, Buffer.from(res.data, 'base64'));
    console.log(`Saved docs/screenshots/${filename}`);
  }

  // 1. Desktop overview (1280 x 1400)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 800));
  await capture('dashboard-desktop.png');

  // 2. Click SP flag to filter destinations
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const spBtn = buttons.find(b => b.textContent.trim() === 'SP');
      if (spBtn) spBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await capture('state-filter-sp.png');

  // 3. Click first destination to open the modal
  await send('Runtime.evaluate', {
    expression: `
      const items = Array.from(document.querySelectorAll('[role="listitem"]'));
      if (items.length > 0) items[0].click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await capture('modal-unlock-maps.png');

  // 4. Press Escape to close modal
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await new Promise(r => setTimeout(r, 800));

  // 5. Kiosk Totem Vertical Display (1080 x 1920)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1080,
    height: 1920,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 800));
  await capture('kiosk-totem-vertical.png');

  // 6. Mobile Smartphone Viewport (390 x 844) - Main Dashboard
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));
  await capture('mobile-responsive.png');

  // 7. Mobile Modal view
  await send('Runtime.evaluate', {
    expression: `
      const items = Array.from(document.querySelectorAll('[role="listitem"]'));
      if (items.length > 0) items[0].click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await capture('mobile-modal.png');

  ws.close();
  chrome.kill();
}

try {
  await run();
} catch (err) {
  console.error(err);
  chrome.kill();
}
