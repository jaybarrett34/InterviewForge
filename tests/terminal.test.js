/**
 * Terminal Integration Test
 * Tests that the terminals actually work as real bash shells
 */

const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Terminal Integration', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../electron/main.js')],
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Get all windows and find the main one (not DevTools)
    const windows = await electronApp.windows();
    console.log('Found windows:', windows.length);

    for (const win of windows) {
      const title = await win.title();
      console.log('Window title:', title);
      if (title.includes('InterviewForge') || title === '') {
        window = win;
        break;
      }
    }

    // If no main window found, wait for it
    if (!window) {
      window = await electronApp.waitForEvent('window', {
        predicate: async (win) => {
          const title = await win.title();
          return !title.includes('DevTools');
        }
      });
    }

    // Wait for app to be ready
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(3000); // Give terminals time to initialize
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('app window opens', async () => {
    const title = await window.title();
    console.log('Window title:', title);
    expect(title).toContain('InterviewForge');
  });

  test('terminals are visible', async () => {
    // Check for terminal containers
    const terminalContainers = await window.locator('.xterm').count();
    console.log('Found xterm containers:', terminalContainers);
    expect(terminalContainers).toBeGreaterThanOrEqual(2);
  });

  test('terminals have content', async () => {
    // Get terminal text content
    const terminals = await window.locator('.xterm-screen').all();
    console.log('Found xterm-screen elements:', terminals.length);

    for (let i = 0; i < terminals.length; i++) {
      const text = await terminals[i].textContent();
      console.log(`Terminal ${i} content:`, text?.substring(0, 100));
    }
  });

  test('can type in left terminal', async () => {
    // Find the left terminal (first one)
    const leftTerminal = await window.locator('.xterm').first();

    // Click to focus - click on the canvas which handles input
    const canvas = await leftTerminal.locator('canvas.xterm-cursor-layer').first();
    if (await canvas.count() > 0) {
      await canvas.click();
      console.log('Clicked on xterm canvas');
    } else {
      await leftTerminal.click();
      console.log('Clicked on xterm container (no canvas found)');
    }
    await window.waitForTimeout(500);

    // Check console for debug logs
    const logs = [];
    window.on('console', msg => {
      if (msg.text().includes('[CodeTerminal]') || msg.text().includes('[useTerminal]')) {
        logs.push(msg.text());
      }
    });

    // Type a command
    await window.keyboard.type('echo "PLAYWRIGHT_TEST"');
    await window.keyboard.press('Enter');

    // Wait for output
    await window.waitForTimeout(2000);

    console.log('Console logs captured:', logs);

    // Check if output appeared
    const terminalText = await leftTerminal.textContent();
    console.log('After typing echo, terminal shows:', terminalText?.substring(0, 300));

    // The output should contain our test string
    expect(terminalText).toContain('PLAYWRIGHT_TEST');
  });

  test('Run button executes code', async () => {
    // Find and click the Run button
    const runButton = await window.locator('button:has-text("Run")').first();
    await runButton.click();

    await window.waitForTimeout(2000);

    // Check terminal for output
    const leftTerminal = await window.locator('.xterm').first();
    const terminalText = await leftTerminal.textContent();
    console.log('After Run button, terminal shows:', terminalText?.substring(0, 300));
  });

  test('electronAPI is available', async () => {
    const hasElectronAPI = await window.evaluate(() => {
      return typeof window.electronAPI !== 'undefined';
    });
    console.log('electronAPI available:', hasElectronAPI);
    expect(hasElectronAPI).toBe(true);
  });

  test('terminal create works', async () => {
    const result = await window.evaluate(async () => {
      try {
        const result = await window.electronAPI.terminal.create(
          '/bin/bash',
          [],
          '/tmp',
          { TERM: 'xterm-256color' }
        );
        return result;
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log('Terminal create result:', result);
    expect(result.success).toBe(true);
  });

  test('xterm input reaches PTY', async () => {
    // Test the full flow: click terminal -> type -> PTY receives input
    const result = await window.evaluate(async () => {
      return new Promise(async (resolve) => {
        const createResult = await window.electronAPI.terminal.create(
          '/bin/bash',
          [],
          '/tmp',
          { TERM: 'xterm-256color' }
        );

        if (!createResult.success) {
          resolve({ error: 'Failed to create terminal', details: createResult });
          return;
        }

        const terminalId = createResult.terminalId;
        let receivedData = '';
        let sentInput = false;

        // Listen for data from PTY
        const unsub = window.electronAPI.terminal.onData(terminalId, (data) => {
          receivedData += data;
        });

        // Simulate sending input (as if user typed)
        await window.electronAPI.terminal.write(terminalId, 'echo XTERM_INPUT_TEST\n');
        sentInput = true;

        // Wait for response
        await new Promise(r => setTimeout(r, 2000));

        // Cleanup
        unsub();
        await window.electronAPI.terminal.kill(terminalId);

        resolve({
          sentInput,
          receivedData: receivedData.length > 0,
          dataContainsEcho: receivedData.includes('XTERM_INPUT_TEST'),
          dataSample: receivedData.substring(0, 200)
        });
      });
    });

    console.log('xterm input test result:', result);
    expect(result.sentInput).toBe(true);
    expect(result.dataContainsEcho).toBe(true);
  });

  test('PTY sends data', async () => {
    // Create a terminal and check if we receive data
    const result = await window.evaluate(async () => {
      return new Promise(async (resolve) => {
        const createResult = await window.electronAPI.terminal.create(
          '/bin/bash',
          [],
          '/tmp',
          { TERM: 'xterm-256color' }
        );

        if (!createResult.success) {
          resolve({ error: 'Failed to create terminal' });
          return;
        }

        const terminalId = createResult.terminalId;
        let receivedData = false;
        let dataContent = '';

        // Listen for data
        const unsub = window.electronAPI.terminal.onData(terminalId, (data) => {
          receivedData = true;
          dataContent += data;
        });

        // Send a command
        await window.electronAPI.terminal.write(terminalId, 'echo "PTY_DATA_TEST"\n');

        // Wait for response
        await new Promise(r => setTimeout(r, 2000));

        // Cleanup
        unsub();
        await window.electronAPI.terminal.kill(terminalId);

        resolve({
          receivedData,
          dataLength: dataContent.length,
          dataSample: dataContent.substring(0, 100)
        });
      });
    });

    console.log('PTY data test result:', result);
    expect(result.receivedData).toBe(true);
  });
});
