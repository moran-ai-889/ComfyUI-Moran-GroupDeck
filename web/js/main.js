import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

console.log("墨染 GroupDeck UI 插件已加载！");

const style = document.createElement("style");
style.textContent = `
  .gd-panel {
    background: rgba(20, 20, 25, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    font-family: sans-serif;
    height: fit-content !important; 
    min-height: auto !important;
    overflow: hidden;
    position: relative;
  }
  .gd-header {
    display: flex !important; 
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px; padding-bottom: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  
  /* 墨染专属品牌 Logo 样式 */
  .gd-brand {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 2px;
    font-family: "STZhongsong", "SimSun", "Microsoft YaHei", serif;
    background: linear-gradient(135deg, #e2e8f0 0%, #64748b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 10px rgba(255,255,255,0.05);
    user-select: none;
  }
  .gd-brand small {
    font-size: 10px; font-weight: normal; color: #555;
    letter-spacing: 1px; margin-left: 4px; -webkit-text-fill-color: #666;
  }

  .gd-header-actions { display: flex; gap: 8px; }
  .gd-icon-btn { cursor: pointer; color: #aaa; font-size: 14px; padding: 2px; transition: color 0.2s; }
  .gd-icon-btn:hover { color: #fff; }
  
  .gd-rows { overflow-y: auto; max-height: 280px; padding-right: 4px; }
  .gd-rows::-webkit-scrollbar { width: 6px; }
  .gd-rows::-webkit-scrollbar-track { background: transparent; }
  .gd-rows::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
  .gd-rows::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
  
  .gd-row {
    display: flex !important; flex-direction: row !important;
    align-items: center !important; justify-content: space-between !important;
    padding: 6px 8px; background: rgba(255, 255, 255, 0.03);
    border-radius: 6px; margin-bottom: 6px; transition: background 0.2s;
  }
  .gd-row:hover { background: rgba(255, 255, 255, 0.08); }
  
  .gd-name {
    flex: 1; color: #ddd; font-size: 12px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 8px;
  }
  
  .gd-actions { display: flex !important; flex-direction: row !important; align-items: center; gap: 6px; }
  
  /* 优化：更宽的耗时显示区 */
  .gd-time {
    font-size: 11px; color: #fbbf24; font-family: monospace;
    width: 55px; text-align: right; margin-right: 2px; opacity: 0.9;
  }

  .gd-toggle {
    display: flex; justify-content: center; align-items: center;
    width: 46px; height: 24px; border-radius: 4px;
    font-size: 11px; font-weight: bold; cursor: pointer;
    user-select: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .gd-toggle.on { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 8px rgba(16, 185, 129, 0.2); }
  .gd-toggle.off { background: rgba(100, 116, 139, 0.2); color: #94a3b8; border-color: rgba(100, 116, 139, 0.3); }
  
  .gd-run, .gd-remove {
    display: flex; justify-content: center; align-items: center;
    width: 22px; height: 24px; border-radius: 4px;
    cursor: pointer; transition: all 0.2s; font-size: 10px;
  }
  .gd-run { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
  .gd-run:hover { background: rgba(59, 130, 246, 0.3); color: #fff; }
  
  .gd-remove { background: transparent; color: #666; border: 1px solid transparent; }
  .gd-remove:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

  .gd-add-menu {
    position: absolute; top: 35px; right: 10px;
    background: rgba(30, 30, 40, 0.95); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px; padding: 6px; z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: none;
    flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto;
  }
  .gd-add-item { padding: 4px 8px; color: #ccc; font-size: 12px; cursor: pointer; border-radius: 4px; white-space: nowrap; }
  .gd-add-item:hover { background: #3b82f6; color: #fff; }
`;
document.head.appendChild(style);

function getNodesInGroup(group) {
  const bounds = group.getBounding();
  return app.graph._nodes.filter(n => 
    n.pos[0] >= bounds[0] && n.pos[1] >= bounds[1] &&
    n.pos[0] + n.size[0] <= bounds[0] + bounds[2] &&
    n.pos[1] + n.size[1] <= bounds[1] + bounds[3]
  );
}

function applyGroupMode(group, forceBypass) {
  const nodesInGroup = getNodesInGroup(group);
  nodesInGroup.forEach(childNode => {
    if (forceBypass) {
      if (childNode._originalMode === undefined) childNode._originalMode = childNode.mode === 4 ? 0 : childNode.mode;
      childNode.mode = 4; 
    } else {
      childNode.mode = childNode._originalMode !== undefined ? childNode._originalMode : 0;
      childNode._originalMode = undefined;
    }
    if (childNode.onModeChange) childNode.onModeChange(childNode.mode);
  });
}

function getGraphState() {
  if (!app.graph.extra) app.graph.extra = {};
  if (!app.graph.extra.groupDeckState) app.graph.extra.groupDeckState = {};
  return app.graph.extra.groupDeckState;
}

function broadcastRefresh() {
  window.dispatchEvent(new CustomEvent("groupdeck-refresh"));
}

// 耗时格式化工具：将秒数转为易读格式
function formatDuration(sec) {
  const s = parseFloat(sec);
  if (s < 60) return `总:${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rs = Math.round(s % 60);
  return `总:${m}分${rs}秒`;
}

async function runSingleGroup(targetGroup, nodeInstance) {
  if (nodeInstance._isRunning) return;
  nodeInstance._isRunning = true;
  nodeInstance._runningGroupTitle = targetGroup.title;
  broadcastRefresh(); 

  const state = getGraphState();
  const originalState = { ...state }; 
  const groups = app.graph._groups || [];

  groups.forEach(g => {
    const isTarget = g.title === targetGroup.title;
    state[g.title] = isTarget; 
    applyGroupMode(g, !isTarget); 
  });
  broadcastRefresh();
  app.graph.setDirtyCanvas(true, true);

  const startTime = performance.now();
  let hasFinished = false;

  const restoreState = (recordTime = true) => {
    if (hasFinished) return;
    hasFinished = true;
    nodeInstance._isRunning = false;

    if (recordTime) {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000); // 保留原始秒数进行格式化
      if (!nodeInstance.properties.groupTimes) nodeInstance.properties.groupTimes = {};
      nodeInstance.properties.groupTimes[targetGroup.title] = duration;
    }

    groups.forEach(g => {
      const prev = originalState[g.title] !== false;
      state[g.title] = prev;
      applyGroupMode(g, !prev); 
    });
    
    broadcastRefresh();
    app.graph.setDirtyCanvas(true, true);
  };

  try {
    await app.queuePrompt(0, 1); 
  } catch (e) {
    console.error("[墨染 GroupDeck] 提交运行失败", e);
    restoreState(false);
    return;
  }

  const onSuccess = () => { api.removeEventListener("execution_success", onSuccess); restoreState(true); };
  const onError = () => { api.removeEventListener("execution_error", onError); restoreState(false); };
  const onInterrupted = () => { api.removeEventListener("execution_interrupted", onInterrupted); restoreState(false); };

  api.addEventListener("execution_success", onSuccess);
  api.addEventListener("execution_error", onError);
  api.addEventListener("execution_interrupted", onInterrupted);

  setTimeout(() => {
    if (!hasFinished) {
      api.removeEventListener("execution_success", onSuccess);
      api.removeEventListener("execution_error", onError);
      api.removeEventListener("execution_interrupted", onInterrupted);
      restoreState(false);
    }
  }, 300000); 
}

app.registerExtension({
  name: "GroupDeck.UI",
  async nodeCreated(node) {
    if (node.comfyClass !== "GroupDeck") return;

    if (!node.properties) node.properties = {};
    if (!node.properties.hiddenGroups) node.properties.hiddenGroups = [];
    if (!node.properties.groupTimes) node.properties.groupTimes = {};
    node._isRunning = false;

    const container = document.createElement("div");
    container.className = "gd-panel";
    container.style.width = "100%";

    const resizeNodeToFit = () => {
      const rows = container.querySelectorAll(".gd-row");
      const idealContentHeight = 35 + (rows.length * 36);
      const maxContentHeight = 300; 
      const contentHeight = Math.min(idealContentHeight, maxContentHeight);
      
      container.style.height = contentHeight + "px";
      const nodeHeight = contentHeight + 40; 
      
      if (node.size[1] !== nodeHeight) node.setSize([Math.max(node.size[0], 400), nodeHeight]);
      
      const domWidget = node.widgets.find(w => w.name === "groupdeck_panel");
      if (domWidget) domWidget.computeSize = () => [Math.max(node.size[0] - 20, 360), contentHeight];
      app.graph.setDirtyCanvas(true, true);
    };

    const renderPanel = () => {
      const allGroups = app.graph._groups || [];
      const state = getGraphState();
      const hiddenGroups = node.properties.hiddenGroups || [];
      const displayGroups = allGroups.filter(g => !hiddenGroups.includes(g.title));
      
      let html = `
        <div class="gd-header">
          <div class="gd-brand">墨染<small>· GroupDeck</small></div>
          <div class="gd-header-actions">
            <span class="gd-icon-btn gd-add-btn" title="添加隐藏组">➕</span>
            <span class="gd-icon-btn gd-refresh" title="刷新">⟳</span>
          </div>
        </div>
        <div class="gd-add-menu">
          ${hiddenGroups.length === 0 ? '<div style="color:#888;padding:4px;">没有隐藏的组</div>' : 
            hiddenGroups.map(h => `<div class="gd-add-item" data-title="${h}">${h}</div>`).join('')}
        </div>
        <div class="gd-rows">
      `;

      if (displayGroups.length === 0) {
        html += `<div style="color:#888; text-align:center; margin-top:10px;">无组，点击右上角 ➕ 添加</div>`;
      } else {
        displayGroups.forEach((g, index) => {
          const nodes = getNodesInGroup(g);
          const isActuallyBypassed = nodes.length > 0 && nodes[0].mode === 4;
          if (isActuallyBypassed) state[g.title] = false; 
          
          const isOn = state[g.title] !== false; 
          
          let timeStr = "--";
          if (node._isRunning && node._runningGroupTitle === g.title) {
            timeStr = "⏳";
          } else if (node.properties.groupTimes[g.title]) {
            timeStr = formatDuration(node.properties.groupTimes[g.title]); // 使用格式化函数
          }

          html += `
            <div class="gd-row">
              <span class="gd-name" title="${g.title}">${g.title || '未命名组'}</span>
              <div class="gd-actions">
                <div class="gd-toggle ${isOn ? 'on' : 'off'}" data-title="${g.title}">
                  ${isOn ? 'ON' : 'OFF'}
                </div>
                <span class="gd-time">${timeStr}</span>
                <div class="gd-run ${node._isRunning ? 'disabled' : ''}" data-title="${g.title}" title="仅运行此组" style="${node._isRunning ? 'opacity:0.4;pointer-events:none;' : ''}">▶</div>
                <div class="gd-remove" data-title="${g.title}" title="移除">✖</div>
              </div>
            </div>
          `;
        });
      }
      html += `</div>`;
      container.innerHTML = html;

      container.querySelector(".gd-refresh").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        node._isRunning = false; 
        renderPanel();
      });

      const addBtn = container.querySelector(".gd-add-btn");
      const addMenu = container.querySelector(".gd-add-menu");
      addBtn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        addMenu.style.display = addMenu.style.display === "flex" ? "none" : "flex";
      });
      
      document.addEventListener("click", () => { addMenu.style.display = "none"; });

      container.querySelectorAll(".gd-add-item").forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          const title = item.dataset.title;
          node.properties.hiddenGroups = node.properties.hiddenGroups.filter(t => t !== title);
          renderPanel();
        });
      });

      container.querySelectorAll(".gd-toggle").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          const title = btn.dataset.title;
          const group = app.graph._groups.find(g => g.title === title);
          if (!group) return;
          
          const isCurrentlyOn = state[title] !== false;
          const nextIsOn = !isCurrentlyOn; 
          state[title] = nextIsOn;
          applyGroupMode(group, !nextIsOn); 
          broadcastRefresh();
          app.graph.setDirtyCanvas(true, true);
        });
      });

      container.querySelectorAll(".gd-run").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (node._isRunning) return;
          const title = btn.dataset.title;
          const group = app.graph._groups.find(g => g.title === title);
          if (group) {
            runSingleGroup(group, node);
          }
        });
      });

      container.querySelectorAll(".gd-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          const title = btn.dataset.title;
          if (!node.properties.hiddenGroups.includes(title)) {
            node.properties.hiddenGroups.push(title);
          }
          renderPanel();
        });
      });

      setTimeout(resizeNodeToFit, 10);
    };

    window.addEventListener("groupdeck-refresh", renderPanel);
    renderPanel();

    node.onConfigure = function() { setTimeout(() => renderPanel(), 300); };

    try {
      const widget = node.addDOMWidget("groupdeck_panel", "groupdeck_panel", container, { serialize: false });
      widget.computeSize = () => [360, 200];
    } catch (e) {
      console.error("[墨染 GroupDeck] DOM 挂载失败:", e);
    }
    
    node.setSize([400, 240]);
  }
});