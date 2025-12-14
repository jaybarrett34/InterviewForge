import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ProblemPane from './ProblemPane';
import CodeTerminal from './CodeTerminal';
import ClaudeTerminal from './ClaudeTerminal';
import Monaco from './Monaco';
import Toolbar from './Toolbar';
import Timer from './Timer';

const Layout = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Top toolbar */}
      <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-4 bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">InterviewForge</h1>
          <Toolbar />
        </div>
        <Timer />
      </div>

      {/* Main content: Problem (20% left) | Editor+Terminals (80% right) */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left: Problem Pane (20% - full height) */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <ProblemPane />
          </Panel>

          <PanelResizeHandle className="w-1 bg-[var(--border-color)] hover:bg-[var(--accent-primary)] transition-colors cursor-col-resize" />

          {/* Right: Editor + Terminals (80%) */}
          <Panel defaultSize={80} minSize={60}>
            <PanelGroup direction="vertical">
              {/* Top: Code Editor */}
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
                  <div className="h-8 px-3 flex items-center justify-between bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">solution.py</span>
                      <span className="text-xs text-[var(--text-muted)]">Python</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Monaco />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-[var(--border-color)] hover:bg-[var(--accent-primary)] transition-colors cursor-row-resize" />

              {/* Bottom: Side-by-side Terminals */}
              <Panel defaultSize={40} minSize={20}>
                <PanelGroup direction="horizontal">
                  {/* Left: Execution Terminal */}
                  <Panel defaultSize={50} minSize={30}>
                    <div className="h-full border-r border-[var(--border-color)]">
                      <CodeTerminal />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="w-1 bg-[var(--border-color)] hover:bg-[var(--accent-primary)] transition-colors cursor-col-resize" />

                  {/* Right: Claude Code Terminal */}
                  <Panel defaultSize={50} minSize={30}>
                    <ClaudeTerminal />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Layout;
