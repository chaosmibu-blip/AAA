// 指令小幫手 - Content Script
(function () {
  "use strict";

  // 預設分類
  const DEFAULT_CATEGORIES = [
    { id: "all", name: "全部", icon: "folder" },
    { id: "favorite", name: "常用", icon: "star" },
    { id: "clipboard", name: "剪貼簿", icon: "clipboard" },
    { id: "vibe", name: "Vibe Coding", icon: "sparkle" },
    { id: "prompt", name: "提問模板", icon: "message" },
    { id: "debug", name: "除錯", icon: "bug" },
    { id: "other", name: "其他", icon: "more" },
  ];

  // 預設指令
  const DEFAULT_COMMANDS = [
    // Vibe Coding 基礎
    {
      id: "v1",
      title: "描述新功能",
      content: `我想做一個 [功能描述]

需求：
- 使用者可以 [操作1]
- 當 [條件] 時，會 [結果]
- 介面要 [風格描述]

請幫我實作這個功能`,
      categoryId: "vibe",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "v2",
      title: "修改現有功能",
      content: `目前 [功能名稱] 的行為是 [現狀描述]

我希望改成 [期望的新行為]

請幫我修改`,
      categoryId: "vibe",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "v3",
      title: "調整畫面樣式",
      content: `請把 [元素名稱] 改成：
- 顏色：[顏色]
- 大小：[大小]
- 位置：[位置]
- 其他：[其他樣式]`,
      categoryId: "vibe",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "v4",
      title: "請求建議做法",
      content: `我想做 [目標描述]

請告訴我：
1. 推薦的做法
2. 需要注意什麼
3. 大概的步驟`,
      categoryId: "vibe",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "v5",
      title: "用白話解釋",
      content: `請用白話文解釋剛才做了什麼改動，以及為什麼這樣做

我是程式新手，請說明得簡單易懂`,
      categoryId: "vibe",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "v6",
      title: "部署上線",
      content: `這個專案要怎麼部署上線？

請給我：
1. 詳細的步驟
2. 需要註冊什麼服務
3. 有沒有免費的方案`,
      categoryId: "vibe",
      isFavorite: false,
      usageCount: 0,
    },
    // 除錯類
    {
      id: "d1",
      title: "回報錯誤",
      content: `我遇到這個錯誤：

[貼上錯誤訊息]

我之前做了：[描述你的操作]
預期結果是：[你期望發生什麼]
實際結果是：[實際發生了什麼]`,
      categoryId: "debug",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "d2",
      title: "功能不正常",
      content: `[功能名稱] 沒有正常運作

問題描述：
- 我點了 [按鈕/操作]
- 但是 [問題描述]
- 應該要 [預期行為]`,
      categoryId: "debug",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "d3",
      title: "畫面跑版",
      content: `畫面顯示有問題

問題：[描述哪裡跑版]
裝置：[手機/電腦/平板]
瀏覽器：[Chrome/Safari/其他]

請幫我修復`,
      categoryId: "debug",
      isFavorite: false,
      usageCount: 0,
    },
    // 提問模板
    {
      id: "p1",
      title: "解釋這段程式碼",
      content: `請用簡單的話解釋這段程式碼在做什麼：

[貼上程式碼]

我是新手，請說明得白話一點`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "p2",
      title: "這樣做對嗎",
      content: `我想確認一下，[你的理解或做法] 這樣對嗎？

如果不對，正確的做法是什麼？`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "p3",
      title: "有更好的做法嗎",
      content: `目前的做法是 [描述現在的做法]

有沒有更好、更簡單的方式？`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
  ];

  // 狀態
  let commands = [];
  let selectedCategory = "all";
  let isPanelOpen = false;
  let isFormOpen = false;
  let isManageMode = false;
  let selectedIds = new Set();
  let editingCommandId = null;
  let isDragging = false;
  let isPointerDown = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let ballX = 0;
  let ballY = 0;

  // 生成唯一 ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 載入指令資料
  async function loadCommands() {
    try {
      const result = await chrome.storage.local.get(["commands"]);
      console.log("[指令小幫手] 載入資料:", result);
      if (result.commands && result.commands.length > 0) {
        commands = result.commands;
        console.log("[指令小幫手] 已載入", commands.length, "個指令");
      } else {
        commands = DEFAULT_COMMANDS;
        await saveCommands();
        console.log("[指令小幫手] 使用預設指令");
      }
    } catch (e) {
      console.error("[指令小幫手] 載入失敗:", e);
      commands = DEFAULT_COMMANDS;
    }
    renderCommandList();
  }

  // 儲存指令資料
  async function saveCommands() {
    try {
      await chrome.storage.local.set({ commands });
      console.log("[指令小幫手] 已儲存", commands.length, "個指令");
    } catch (e) {
      console.error("[指令小幫手] 儲存失敗:", e);
    }
  }

  // 載入懸浮球位置
  async function loadBallPosition() {
    try {
      const result = await chrome.storage.local.get(["ballPosition"]);
      if (result.ballPosition) {
        ballX = result.ballPosition.x;
        ballY = result.ballPosition.y;
      } else {
        ballX = window.innerWidth - 70;
        ballY = window.innerHeight / 2 - 25;
      }
    } catch (e) {
      ballX = window.innerWidth - 70;
      ballY = window.innerHeight / 2 - 25;
    }
    updateBallPosition();
  }

  // 儲存懸浮球位置
  async function saveBallPosition() {
    try {
      await chrome.storage.local.set({ ballPosition: { x: ballX, y: ballY } });
    } catch (e) {
      console.error("Failed to save ball position:", e);
    }
  }

  // 更新懸浮球位置
  function updateBallPosition() {
    const root = document.getElementById("cmd-helper-root");
    if (root) {
      root.style.left = ballX + "px";
      root.style.top = ballY + "px";
    }
  }

  // 建立 DOM
  function createDOM() {
    // 容器
    const root = document.createElement("div");
    root.id = "cmd-helper-root";

    // 懸浮球
    const ball = document.createElement("div");
    ball.id = "cmd-helper-ball";
    ball.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    `;

    // 指令面板
    const panel = document.createElement("div");
    panel.id = "cmd-helper-panel";
    panel.innerHTML = `
      <div class="cmd-panel-header">
        <h3 class="cmd-panel-title">我的指令</h3>
        <div class="cmd-panel-actions">
          <button class="cmd-panel-action-btn" id="cmd-manage-btn" title="管理">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="cmd-panel-action-btn" id="cmd-add-btn" title="新增">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="cmd-manage-bar" id="cmd-manage-bar">
        <label class="cmd-select-all">
          <input type="checkbox" id="cmd-select-all-checkbox">
          <span>全選</span>
        </label>
        <button class="cmd-delete-selected-btn" id="cmd-delete-selected-btn">
          刪除選取 (<span id="cmd-selected-count">0</span>)
        </button>
      </div>
      <div class="cmd-category-tabs" id="cmd-category-tabs"></div>
      <div class="cmd-list" id="cmd-list"></div>
      <div class="cmd-form" id="cmd-form">
        <div class="cmd-form-group">
          <label class="cmd-form-label">指令名稱</label>
          <input type="text" class="cmd-form-input" id="cmd-form-title" placeholder="例如：提交程式碼">
        </div>
        <div class="cmd-form-group">
          <label class="cmd-form-label">指令內容</label>
          <textarea class="cmd-form-input cmd-form-textarea" id="cmd-form-content" placeholder="例如：git commit -m &quot;完成功能&quot;"></textarea>
        </div>
        <div class="cmd-form-group">
          <label class="cmd-form-label">分類</label>
          <div class="cmd-form-categories" id="cmd-form-categories"></div>
        </div>
        <div class="cmd-form-buttons">
          <button class="cmd-form-btn cmd-form-btn-cancel" id="cmd-form-cancel">取消</button>
          <button class="cmd-form-btn cmd-form-btn-save" id="cmd-form-save">儲存</button>
        </div>
      </div>
    `;

    root.appendChild(ball);
    root.appendChild(panel);
    document.body.appendChild(root);

    // 複製提示
    const toast = document.createElement("div");
    toast.className = "cmd-copy-toast";
    toast.id = "cmd-copy-toast";
    toast.textContent = "已複製到剪貼簿";
    document.body.appendChild(toast);

    // 綁定事件
    bindEvents();
  }

  // 綁定事件
  function bindEvents() {
    const ball = document.getElementById("cmd-helper-ball");
    const panel = document.getElementById("cmd-helper-panel");
    const addBtn = document.getElementById("cmd-add-btn");
    const manageBtn = document.getElementById("cmd-manage-btn");
    const selectAllCheckbox = document.getElementById("cmd-select-all-checkbox");
    const deleteSelectedBtn = document.getElementById("cmd-delete-selected-btn");
    const formCancelBtn = document.getElementById("cmd-form-cancel");
    const formSaveBtn = document.getElementById("cmd-form-save");

    // 懸浮球拖動
    ball.addEventListener("mousedown", onDragStart);
    ball.addEventListener("touchstart", onDragStart, { passive: false });
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("touchmove", onDragMove, { passive: false });
    document.addEventListener("mouseup", onDragEnd);
    document.addEventListener("touchend", onDragEnd);

    // 點擊外部關閉面板
    document.addEventListener("click", (e) => {
      const root = document.getElementById("cmd-helper-root");
      if (root && !root.contains(e.target) && isPanelOpen) {
        closePanel();
      }
    });

    // 新增按鈕
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openForm();
    });

    // 管理按鈕
    manageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleManageMode();
    });

    // 全選 checkbox
    selectAllCheckbox.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleSelectAll(e.target.checked);
    });

    // 刪除選取按鈕
    deleteSelectedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSelected();
    });

    // 表單取消
    formCancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeForm();
    });

    // 表單儲存
    formSaveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveForm();
    });

    // 監聽 copy 事件 - 自動收集複製的內容（不需要開面板）
    document.addEventListener("copy", (e) => {
      // 不在擴充功能內部操作時才收集
      const isInExtension = e.target.closest && e.target.closest("#cmd-helper-root");
      if (!isInExtension && !isFormOpen && !isManageMode) {
        const selectedText = getSelectedText();
        if (selectedText && selectedText.length > 0) {
          autoCollectText(selectedText);
        }
      }
    });
  }

  // 獲取選取的文字（支援輸入框和一般文字）
  function getSelectedText() {
    const activeElement = document.activeElement;

    // 檢查是否在 input 或 textarea 中
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      if (start !== end) {
        return activeElement.value.substring(start, end).trim();
      }
    }

    // 否則使用 window.getSelection()
    return window.getSelection().toString().trim();
  }

  // 拖動開始
  function onDragStart(e) {
    e.preventDefault();
    isDragging = false;
    isPointerDown = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartX = clientX - ballX;
    dragStartY = clientY - ballY;

    const ball = document.getElementById("cmd-helper-ball");
    ball.style.cursor = "grabbing";
  }

  // 拖動中
  function onDragMove(e) {
    if (dragStartX === 0 && dragStartY === 0) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const newX = clientX - dragStartX;
    const newY = clientY - dragStartY;

    // 判斷是否為拖動（移動超過 5px）
    if (Math.abs(newX - ballX) > 5 || Math.abs(newY - ballY) > 5) {
      isDragging = true;
    }

    if (isDragging) {
      e.preventDefault();
      ballX = Math.max(0, Math.min(window.innerWidth - 50, newX));
      ballY = Math.max(0, Math.min(window.innerHeight - 50, newY));
      updateBallPosition();
      updatePanelPosition();
    }
  }

  // 拖動結束
  function onDragEnd(e) {
    if (!isPointerDown) return;

    const ball = document.getElementById("cmd-helper-ball");
    ball.style.cursor = "grab";

    if (!isDragging) {
      // 點擊行為
      togglePanel();
    } else {
      // 拖動結束，吸附到邊緣
      snapToEdge();
      saveBallPosition();
    }

    dragStartX = 0;
    dragStartY = 0;
    isDragging = false;
    isPointerDown = false;
  }

  // 吸附到邊緣
  function snapToEdge() {
    const centerX = window.innerWidth / 2;
    if (ballX + 25 < centerX) {
      ballX = 10;
    } else {
      ballX = window.innerWidth - 60;
    }
    updateBallPosition();
    updatePanelPosition();
  }

  // 切換面板
  function togglePanel() {
    if (isPanelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // 開啟面板
  function openPanel() {
    const panel = document.getElementById("cmd-helper-panel");
    isPanelOpen = true;
    isFormOpen = false;
    isManageMode = false;
    selectedIds.clear();
    panel.classList.add("open");
    document.getElementById("cmd-form").classList.remove("open");
    document.getElementById("cmd-list").style.display = "block";
    document.querySelector(".cmd-category-tabs").style.display = "flex";
    document.getElementById("cmd-manage-bar").classList.remove("open");
    document.getElementById("cmd-manage-btn").classList.remove("active");
    document.querySelector(".cmd-panel-title").textContent = "我的指令";
    updatePanelPosition();
    renderCategoryTabs();
    renderCommandList();
  }

  // 關閉面板
  function closePanel() {
    const panel = document.getElementById("cmd-helper-panel");
    isPanelOpen = false;
    isFormOpen = false;
    isManageMode = false;
    selectedIds.clear();
    panel.classList.remove("open");
  }

  // 切換管理模式
  function toggleManageMode() {
    isManageMode = !isManageMode;
    selectedIds.clear();

    const manageBar = document.getElementById("cmd-manage-bar");
    const manageBtn = document.getElementById("cmd-manage-btn");
    const selectAllCheckbox = document.getElementById("cmd-select-all-checkbox");

    if (isManageMode) {
      manageBar.classList.add("open");
      manageBtn.classList.add("active");
      document.querySelector(".cmd-panel-title").textContent = "管理指令";
    } else {
      manageBar.classList.remove("open");
      manageBtn.classList.remove("active");
      document.querySelector(".cmd-panel-title").textContent = "我的指令";
    }

    selectAllCheckbox.checked = false;
    updateSelectedCount();
    renderCommandList();
  }

  // 全選/取消全選
  function toggleSelectAll(checked) {
    const filtered = getFilteredCommands();

    if (checked) {
      filtered.forEach(cmd => selectedIds.add(cmd.id));
    } else {
      selectedIds.clear();
    }

    updateSelectedCount();
    renderCommandList();
  }

  // 切換單個選取
  function toggleSelectItem(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }

    updateSelectedCount();
    updateSelectAllCheckbox();
  }

  // 更新選取數量
  function updateSelectedCount() {
    document.getElementById("cmd-selected-count").textContent = selectedIds.size;

    const deleteBtn = document.getElementById("cmd-delete-selected-btn");
    if (selectedIds.size > 0) {
      deleteBtn.classList.add("active");
    } else {
      deleteBtn.classList.remove("active");
    }
  }

  // 更新全選 checkbox 狀態
  function updateSelectAllCheckbox() {
    const filtered = getFilteredCommands();
    const selectAllCheckbox = document.getElementById("cmd-select-all-checkbox");

    if (filtered.length === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (filtered.every(cmd => selectedIds.has(cmd.id))) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else if (filtered.some(cmd => selectedIds.has(cmd.id))) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
  }

  // 刪除選取的指令
  async function deleteSelected() {
    if (selectedIds.size === 0) return;

    if (confirm(`確定要刪除 ${selectedIds.size} 個指令嗎？`)) {
      commands = commands.filter(c => !selectedIds.has(c.id));
      await saveCommands();
      selectedIds.clear();
      updateSelectedCount();
      renderCommandList();

      // 如果刪完了就退出管理模式
      if (commands.length === 0) {
        toggleManageMode();
      }
    }
  }

  // 取得篩選後的指令
  function getFilteredCommands() {
    let filtered = commands;

    if (selectedCategory === "favorite") {
      filtered = commands.filter((cmd) => cmd.isFavorite);
    } else if (selectedCategory !== "all") {
      filtered = commands.filter((cmd) => cmd.categoryId === selectedCategory);
    }

    return filtered;
  }

  // 更新面板位置
  function updatePanelPosition() {
    const panel = document.getElementById("cmd-helper-panel");
    const centerX = window.innerWidth / 2;

    panel.classList.remove("position-left", "position-right");
    if (ballX + 25 < centerX) {
      panel.classList.add("position-right");
    } else {
      panel.classList.add("position-left");
    }
  }

  // 渲染分類標籤
  function renderCategoryTabs() {
    const container = document.getElementById("cmd-category-tabs");
    container.innerHTML = DEFAULT_CATEGORIES.map(
      (cat) => `
      <button class="cmd-category-tab ${selectedCategory === cat.id ? "active" : ""}" data-id="${cat.id}">
        ${cat.name}
      </button>
    `
    ).join("");

    // 綁定事件
    container.querySelectorAll(".cmd-category-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedCategory = btn.dataset.id;
        renderCategoryTabs();
        renderCommandList();
      });
    });
  }

  // 渲染指令列表
  function renderCommandList() {
    const container = document.getElementById("cmd-list");
    let filtered = getFilteredCommands();

    // 排序：收藏優先，使用次數多的優先
    filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.usageCount - a.usageCount;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="cmd-empty">
          <div class="cmd-empty-icon">📋</div>
          <p class="cmd-empty-text">還沒有指令</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (cmd) => `
      <div class="cmd-item ${isManageMode ? 'manage-mode' : ''} ${selectedIds.has(cmd.id) ? 'selected' : ''}" data-id="${cmd.id}">
        ${isManageMode ? `
          <label class="cmd-item-checkbox" onclick="event.stopPropagation()">
            <input type="checkbox" ${selectedIds.has(cmd.id) ? 'checked' : ''} data-id="${cmd.id}">
            <span class="cmd-checkbox-mark"></span>
          </label>
        ` : ''}
        <div class="cmd-item-main">
          <div class="cmd-item-title">
            <button class="cmd-favorite-btn ${cmd.isFavorite ? 'active' : ''}" data-id="${cmd.id}" title="${cmd.isFavorite ? '取消收藏' : '加入收藏'}">
              ${cmd.isFavorite ? '★' : '☆'}
            </button>
            ${escapeHtml(cmd.title)}
            ${!isManageMode ? `
              <div class="cmd-item-actions">
                <button class="cmd-item-action-btn cmd-edit-btn" data-id="${cmd.id}" title="編輯">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="cmd-item-action-btn cmd-delete-btn" data-id="${cmd.id}" title="刪除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ` : ''}
          </div>
          <p class="cmd-item-content">${escapeHtml(cmd.content)}</p>
        </div>
      </div>
    `
      )
      .join("");

    // 綁定點擊事件
    container.querySelectorAll(".cmd-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (
          e.target.closest(".cmd-edit-btn") ||
          e.target.closest(".cmd-delete-btn") ||
          e.target.closest(".cmd-item-checkbox")
        ) {
          return;
        }
        e.stopPropagation();
        const id = item.dataset.id;

        if (isManageMode) {
          // 管理模式：點擊整個項目也能切換選取
          toggleSelectItem(id);
          item.classList.toggle("selected");
          const checkbox = item.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = selectedIds.has(id);
        } else {
          // 正常模式：複製
          const cmd = commands.find((c) => c.id === id);
          if (cmd) {
            copyToClipboard(cmd);
          }
        }
      });
    });

    // 綁定 checkbox 事件
    container.querySelectorAll('.cmd-item-checkbox input').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const id = checkbox.dataset.id;
        toggleSelectItem(id);
        const item = checkbox.closest(".cmd-item");
        item.classList.toggle("selected", selectedIds.has(id));
      });
    });

    // 綁定收藏按鈕
    container.querySelectorAll(".cmd-favorite-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        toggleFavorite(id);
      });
    });

    // 綁定編輯按鈕
    container.querySelectorAll(".cmd-edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        editCommand(id);
      });
    });

    // 綁定刪除按鈕
    container.querySelectorAll(".cmd-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deleteCommand(id);
      });
    });

    // 更新全選 checkbox
    if (isManageMode) {
      updateSelectAllCheckbox();
    }
  }

  // 複製到剪貼簿
  async function copyToClipboard(cmd) {
    try {
      await navigator.clipboard.writeText(cmd.content);

      // 更新使用次數
      cmd.usageCount++;
      await saveCommands();

      // 顯示提示
      showToast();

      // 關閉面板
      closePanel();
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }

  // 顯示複製成功提示
  function showToast() {
    const toast = document.getElementById("cmd-copy-toast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1500);
  }

  // 開啟表單
  function openForm(commandId = null) {
    editingCommandId = commandId;
    isFormOpen = true;
    isManageMode = false;
    selectedIds.clear();

    document.getElementById("cmd-list").style.display = "none";
    document.querySelector(".cmd-category-tabs").style.display = "none";
    document.getElementById("cmd-manage-bar").classList.remove("open");
    document.getElementById("cmd-manage-btn").classList.remove("active");
    document.getElementById("cmd-form").classList.add("open");

    // 渲染分類選項
    const categoriesContainer = document.getElementById("cmd-form-categories");
    const selectableCategories = DEFAULT_CATEGORIES.filter(
      (cat) => cat.id !== "all" && cat.id !== "favorite"
    );

    let selectedCategoryId = "other";

    if (commandId) {
      const cmd = commands.find((c) => c.id === commandId);
      if (cmd) {
        document.getElementById("cmd-form-title").value = cmd.title;
        document.getElementById("cmd-form-content").value = cmd.content;
        selectedCategoryId = cmd.categoryId;
      }
    } else {
      document.getElementById("cmd-form-title").value = "";
      document.getElementById("cmd-form-content").value = "";
    }

    categoriesContainer.innerHTML = selectableCategories
      .map(
        (cat) => `
      <button type="button" class="cmd-category-tab ${selectedCategoryId === cat.id ? "active" : ""}" data-id="${cat.id}">
        ${cat.name}
      </button>
    `
      )
      .join("");

    // 綁定分類選擇事件
    categoriesContainer.querySelectorAll(".cmd-category-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        categoriesContainer
          .querySelectorAll(".cmd-category-tab")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    document.querySelector(".cmd-panel-title").textContent = commandId
      ? "編輯指令"
      : "新增指令";
  }

  // 關閉表單
  function closeForm() {
    isFormOpen = false;
    editingCommandId = null;

    document.getElementById("cmd-form").classList.remove("open");
    document.getElementById("cmd-list").style.display = "block";
    document.querySelector(".cmd-category-tabs").style.display = "flex";
    document.querySelector(".cmd-panel-title").textContent = "我的指令";
  }

  // 自動收集文字內容
  async function autoCollectText(content) {
    if (!content) return;

    // 檢查是否已經有相同內容（避免重複收集）
    const isDuplicate = commands.some(cmd => cmd.content === content);
    if (isDuplicate) {
      return; // 已存在就不重複收集
    }

    // 自動生成標題（取第一行前 30 個字元）
    const title = content.split("\n")[0].substring(0, 30) || "未命名";

    // 新增到指令庫
    commands.push({
      id: generateId(),
      title,
      content,
      categoryId: "clipboard",
      isFavorite: false,
      usageCount: 0,
    });

    await saveCommands();
    showToastMessage("已自動收集");

    // 重新渲染列表
    if (isPanelOpen) {
      renderCommandList();
    }
  }

  // 顯示提示訊息
  function showToastMessage(message) {
    const toast = document.getElementById("cmd-copy-toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      toast.textContent = "已複製到剪貼簿";
    }, 1500);
  }

  // 儲存表單
  async function saveForm() {
    const title = document.getElementById("cmd-form-title").value.trim();
    const content = document.getElementById("cmd-form-content").value.trim();
    const activeCategory = document.querySelector(
      "#cmd-form-categories .cmd-category-tab.active"
    );
    const categoryId = activeCategory ? activeCategory.dataset.id : "other";

    if (!title || !content) {
      alert("請填寫指令名稱和內容");
      return;
    }

    if (editingCommandId) {
      // 編輯模式
      const cmd = commands.find((c) => c.id === editingCommandId);
      if (cmd) {
        cmd.title = title;
        cmd.content = content;
        cmd.categoryId = categoryId;
      }
    } else {
      // 新增模式
      commands.push({
        id: generateId(),
        title,
        content,
        categoryId,
        isFavorite: false,
        usageCount: 0,
      });
    }

    await saveCommands();
    closeForm();
    renderCommandList();
  }

  // 切換收藏狀態
  async function toggleFavorite(id) {
    const cmd = commands.find((c) => c.id === id);
    if (cmd) {
      cmd.isFavorite = !cmd.isFavorite;
      await saveCommands();
      renderCommandList();
      showToastMessage(cmd.isFavorite ? "已加入常用" : "已取消常用");
    }
  }

  // 編輯指令
  function editCommand(id) {
    openForm(id);
  }

  // 刪除指令
  async function deleteCommand(id) {
    if (confirm("確定要刪除這個指令嗎？")) {
      commands = commands.filter((c) => c.id !== id);
      await saveCommands();
      renderCommandList();
    }
  }

  // HTML 轉義
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // 初始化
  function init() {
    createDOM();
    loadBallPosition();
    loadCommands();
  }

  // 等待 DOM 載入完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
