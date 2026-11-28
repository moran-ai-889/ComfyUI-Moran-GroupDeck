import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import "./multiprompt.js";

console.log("墨染 GroupDeck 插件已加载！");

const style = document.createElement("style");
style.textContent = `
  /* ======== 画布节点的样式 ======== */
  .gd-panel {
    background: rgba(20, 20, 25, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    font-family: sans-serif;
    width: 100% !important;
    height: 100% !important; 
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .gd-header {
    display: flex !important; 
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px; 
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0; 
  }
  .gd-brand {
    font-size: 20px;
    font-weight: 900; 
    letter-spacing: 2px;
    font-family: "STZhongsong", "SimSun", "Microsoft YaHei", serif;
    background: linear-gradient(135deg, #e2e8f0 0%, #64748b 100%);
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent;
    user-select: none;
  }
  .gd-brand small { 
    font-size: 13px; 
    font-weight: normal; 
    color: #555; 
    letter-spacing: 1px; 
    margin-left: 6px; 
    -webkit-text-fill-color: #666; 
  }
  .gd-header-actions { display: flex; gap: 10px; align-items: center; }
  .gd-icon-btn { cursor: pointer; color: #aaa; font-size: 18px; padding: 4px; transition: color 0.2s; }
  .gd-icon-btn:hover { color: #fff; }
  
  .gd-rows { flex: 1; overflow-y: auto; padding-right: 4px; min-height: 0; }
  .gd-rows::-webkit-scrollbar { width: 6px; }
  .gd-rows::-webkit-scrollbar-track { background: transparent; }
  .gd-rows::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
  .gd-rows::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
  
  .gd-row {
    display: flex !important; flex-direction: row !important;
    align-items: center !important; justify-content: space-between !important;
    padding: 10px 12px; 
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px; 
    margin-bottom: 8px; 
    transition: background 0.2s;
    flex-shrink: 0; 
  }
  .gd-row:hover { background: rgba(255, 255, 255, 0.08); }
  
  .gd-name {
    flex: 1; color: #ddd; 
    font-size: 16px; 
    font-weight: bold;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 10px;
    cursor: pointer; 
    transition: all 0.2s ease;
  }
  .gd-name:hover { color: #60a5fa; text-shadow: 0 0 8px rgba(96, 165, 250, 0.6); }
  
  .gd-actions { display: flex !important; flex-direction: row !important; align-items: center; gap: 8px; }
  
  .gd-time {
    font-size: 14px; 
    color: #fbbf24; font-family: monospace;
    width: 85px; text-align: right; margin-right: 4px; opacity: 0.9;
    white-space: nowrap; 
  }

  .gd-toggle {
    display: flex; justify-content: center; align-items: center;
    width: 56px; 
    height: 30px; 
    border-radius: 6px;
    font-size: 13px; 
    font-weight: bold; cursor: pointer;
    user-select: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .gd-toggle.on { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 8px rgba(16, 185, 129, 0.2); }
  .gd-toggle.off { background: rgba(100, 116, 139, 0.2); color: #94a3b8; border-color: rgba(100, 116, 139, 0.3); }
  
  .gd-run, .gd-remove {
    display: flex; justify-content: center; align-items: center;
    width: 28px; 
    height: 30px; 
    border-radius: 6px;
    cursor: pointer; transition: all 0.2s; font-size: 14px; 
  }
  .gd-run { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
  .gd-run:hover { background: rgba(59, 130, 246, 0.3); color: #fff; }
  .gd-remove { background: transparent; color: #666; border: 1px solid transparent; }
  .gd-remove:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

  .gd-add-menu {
    position: absolute; top: 45px; right: 15px;
    background: rgba(30, 30, 40, 0.95); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px; padding: 8px; z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: none;
    flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;
  }
  .gd-add-item { padding: 6px 10px; color: #ccc; font-size: 14px; cursor: pointer; border-radius: 4px; white-space: nowrap; }
  .gd-add-item:hover { background: #3b82f6; color: #fff; }

  /* ======== 独立悬浮窗的样式 ======== */
  .gd-floating-widget {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 420px;
    height: 500px;
    background: rgba(15, 17, 23, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.1);
    z-index: 99999;
    display: none;
    flex-direction: column;
    resize: both;
    overflow: hidden;
  }
  .gd-floating-header {
    padding: 10px 15px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
  }
`;
document.head.appendChild(style);

// 工具函数保持不变
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
      const duration = ((endTime - startTime) / 1000); 
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

  try { await app.queuePrompt(0, 1); } catch (e) {
    restoreState(false); return;
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

// ======== 渲染列表的公共函数 ========
function renderList(container, node, activeGroups, hiddenGroups, isFloating = false) {
  const allGroups = app.graph._groups || [];
  const state = getGraphState();
  const displayGroups = allGroups.filter(g => !hiddenGroups.includes(g.title));
  
  let html = ``;
  if (displayGroups.length === 0) {
    html += `<div style="color:#888; text-align:center; margin-top:10px; font-size:16px;">无组，点击 ➕ 添加</div>`;
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
        timeStr = formatDuration(node.properties.groupTimes[g.title]); 
      }

      html += `
        <div class="gd-row">
          <span class="gd-name" data-title="${g.title}" title="点击定位到此组">${g.title || '未命名组'}</span>
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
  container.innerHTML = html;

  // 绑定事件
  container.querySelectorAll(".gd-name").forEach(nameEl => {
    nameEl.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const title = nameEl.dataset.title;
      const group = app.graph._groups.find(g => g.title === title);
      if (!group) return;
      const groupNodes = getNodesInGroup(group);
      if (groupNodes.length > 0) {
        app.canvas.centerOnNode(groupNodes[0]);
      } else {
        const bounds = group.getBounding();
        const centerX = bounds[0] + bounds[2] / 2;
        const centerY = bounds[1] + bounds[3] / 2;
        app.canvas.ds.offset[0] = -centerX + (app.canvas.canvas.width / 2) / app.canvas.ds.scale;
        app.canvas.ds.offset[1] = -centerY + (app.canvas.canvas.height / 2) / app.canvas.ds.scale;
      }
      app.graph.setDirtyCanvas(true, true);
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
      if (group) runSingleGroup(group, node);
    });
  });

  container.querySelectorAll(".gd-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const title = btn.dataset.title;
      if (!node.properties.hiddenGroups.includes(title)) {
        node.properties.hiddenGroups.push(title);
      }
      broadcastRefresh();
    });
  });
}

// ======== 创建独立悬浮窗 ========
let floatingWidget = null;
function toggleFloatingWidget(node) {
  if (floatingWidget && floatingWidget.style.display === "flex") {
    floatingWidget.style.display = "none";
    return;
  }

  if (!floatingWidget) {
    floatingWidget = document.createElement("div");
    floatingWidget.className = "gd-floating-widget";
    
    // 构建悬浮窗结构
    floatingWidget.innerHTML = `
      <div class="gd-floating-header">
        <div class="gd-brand" style="font-size:16px;">墨染悬浮主控</div>
        <div class="gd-header-actions">
          <span class="gd-icon-btn gd-add-btn" title="添加">➕</span>
          <span class="gd-icon-btn gd-close-btn" title="关闭">✖</span>
        </div>
      </div>
      <div class="gd-add-menu"></div>
      <div class="gd-rows" style="padding: 10px;"></div>
    `;
    document.body.appendChild(floatingWidget);

    const header = floatingWidget.querySelector(".gd-floating-header");
    const rowsContainer = floatingWidget.querySelector(".gd-rows");
    const addMenu = floatingWidget.querySelector(".gd-add-menu");
    const addBtn = floatingWidget.querySelector(".gd-add-btn");
    const closeBtn = floatingWidget.querySelector(".gd-close-btn");

    // 悬浮窗拖拽
    let isDragging = false, startX, startY, startLeft, startTop;
    header.addEventListener("mousedown", (e) => {
      if (e.target.closest('.gd-icon-btn')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = floatingWidget.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      floatingWidget.style.left = (startLeft + e.clientX - startX) + "px";
      floatingWidget.style.top = (startTop + e.clientY - startY) + "px";
      floatingWidget.style.right = "auto"; // 取消 right 约束
    });
    window.addEventListener("mouseup", () => { isDragging = false; });

    closeBtn.addEventListener("click", () => { floatingWidget.style.display = "none"; });
    
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addMenu.style.display = addMenu.style.display === "flex" ? "none" : "flex";
      const hiddenGroups = node.properties.hiddenGroups || [];
      addMenu.innerHTML = hiddenGroups.length === 0 ? '<div style="color:#888;padding:4px;">没有隐藏的组</div>' : 
        hiddenGroups.map(h => `<div class="gd-add-item" data-title="${h}">${h}</div>`).join('');
      
      addMenu.querySelectorAll(".gd-add-item").forEach(item => {
        item.addEventListener("click", () => {
          const title = item.dataset.title;
          node.properties.hiddenGroups = node.properties.hiddenGroups.filter(t => t !== title);
          broadcastRefresh();
          addMenu.style.display = "none";
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (addMenu.style.display === "flex" && !addBtn.contains(e.target)) {
        addMenu.style.display = "none";
      }
    });
    
    // 监听全局刷新
    window.addEventListener("groupdeck-refresh", () => {
      if (floatingWidget.style.display === "flex") {
        renderList(rowsContainer, node, null, node.properties.hiddenGroups || [], true);
      }
    });
  }

  // 显示并渲染
  floatingWidget.style.display = "flex";
  const rowsContainer = floatingWidget.querySelector(".gd-rows");
  renderList(rowsContainer, node, null, node.properties.hiddenGroups || [], true);
}

// ======== 注册画布原生节点 ========
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

    const renderPanel = () => {
      const allGroups = app.graph._groups || [];
      const hiddenGroups = node.properties.hiddenGroups || [];
      
      let html = `
        <div class="gd-header">
          <div class="gd-brand">墨染<small>· GroupDeck</small></div>
          <div class="gd-header-actions">
            <span class="gd-icon-btn gd-float-btn" title="悬浮独立控制台">🖥️</span>
            <span class="gd-icon-btn gd-add-btn" title="添加隐藏组">➕</span>
            <span class="gd-icon-btn gd-refresh" title="刷新">⟳</span>
          </div>
        </div>
        <div class="gd-add-menu">
          ${hiddenGroups.length === 0 ? '<div style="color:#888;padding:4px;">没有隐藏的组</div>' : 
            hiddenGroups.map(h => `<div class="gd-add-item" data-title="${h}">${h}</div>`).join('')}
        </div>
        <div class="gd-rows"></div>
      `;
      container.innerHTML = html;

      const rowsContainer = container.querySelector(".gd-rows");
      renderList(rowsContainer, node, allGroups, hiddenGroups, false);

      // 绑定特殊按钮（悬浮、刷新、添加菜单）
      container.querySelector(".gd-float-btn").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        toggleFloatingWidget(node);
      });

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
    };

    window.addEventListener("groupdeck-refresh", renderPanel);
    renderPanel();

    node.onConfigure = function() { setTimeout(() => renderPanel(), 300); };

    try {
      const widget = node.addDOMWidget("groupdeck_panel", "groupdeck_panel", container, {
        serialize: false,
        hideOnZoom: false,
        computeSize: (width) => [width, node.size[1]]
      });
    } catch (e) {
      console.error("[墨染 GroupDeck] DOM 挂载失败:", e);
    }
    
    const onResize = node.onResize;
    node.onResize = function(size) {
      onResize?.apply(this, arguments);
      if (container) {
        container.style.height = (size[1] - 35) + "px";
        container.style.width = (size[0] - 15) + "px";
      }
    };
    
    node.setSize([500, 300]);
  }
});