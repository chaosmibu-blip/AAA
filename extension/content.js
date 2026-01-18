// 指令小幫手 - Content Script
(function () {
  "use strict";

  // 預設分類
  const DEFAULT_CATEGORIES = [
    { id: "all", name: "全部", icon: "folder" },
    { id: "favorite", name: "常用", icon: "star" },
    { id: "prompt", name: "提問模板", icon: "message" },
    { id: "git", name: "Git", icon: "git" },
    { id: "dev", name: "開發", icon: "code" },
    { id: "debug", name: "Debug", icon: "bug" },
    { id: "other", name: "其他", icon: "more" },
  ];

  // 預設指令
  const DEFAULT_COMMANDS = [
    // 提問模板
    {
      id: "p1",
      title: "請求程式碼審查",
      content: `請幫我審查以下程式碼，檢查：
1. 是否有潛在的 bug 或錯誤
2. 效能是否可以優化
3. 程式碼風格是否一致
4. 有沒有安全性問題

[在這裡貼上你的程式碼]`,
      categoryId: "prompt",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "p2",
      title: "解釋錯誤訊息",
      content: `我遇到這個錯誤訊息：

[在這裡貼上錯誤訊息]

請用簡單易懂的方式解釋：
1. 這個錯誤是什麼意思
2. 可能的原因有哪些
3. 如何修復這個問題`,
      categoryId: "prompt",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "p3",
      title: "寫單元測試",
      content: `請幫以下函式寫單元測試，需要包含：
1. 正常情況的測試
2. 邊界條件測試
3. 錯誤處理測試

[在這裡貼上你的函式]`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "p4",
      title: "重構程式碼",
      content: `請幫我重構以下程式碼，目標是：
1. 提高可讀性
2. 減少重複代碼
3. 遵循最佳實踐
4. 保持原有功能不變

請解釋你做了哪些改動和為什麼。

[在這裡貼上你的程式碼]`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "p5",
      title: "解釋程式碼",
      content: `請用簡單的話解釋這段程式碼在做什麼，包含：
1. 整體功能說明
2. 逐行或逐區塊解釋
3. 使用了哪些技術或設計模式

[在這裡貼上程式碼]`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "p6",
      title: "功能實作建議",
      content: `我想實作這個功能：

[描述你想做的功能]

請告訴我：
1. 推薦的技術方案
2. 需要注意的地方
3. 大概的實作步驟
4. 可能遇到的問題`,
      categoryId: "prompt",
      isFavorite: false,
      usageCount: 0,
    },
    // Git 指令
    {
      id: "g1",
      title: "提交程式碼",
      content: 'git commit -m "完成功能"',
      categoryId: "git",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "g2",
      title: "查看狀態",
      content: "git status",
      categoryId: "git",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "g3",
      title: "推送到遠端",
      content: "git push origin main",
      categoryId: "git",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "g4",
      title: "拉取最新代碼",
      content: "git pull origin main",
      categoryId: "git",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "g5",
      title: "建立新分支",
      content: "git checkout -b feature/新功能名稱",
      categoryId: "git",
      isFavorite: false,
      usageCount: 0,
    },
    // 開發指令
    {
      id: "d1",
      title: "啟動開發伺服器",
      content: "npm run dev",
      categoryId: "dev",
      isFavorite: true,
      usageCount: 0,
    },
    {
      id: "d2",
      title: "安裝套件",
      content: "npm install 套件名稱",
      categoryId: "dev",
      isFavorite: false,
      usageCount: 0,
    },
    {
      id: "d3",
      title: "執行測試",
      content: "npm test",
      categoryId: "dev",
      isFavorite: false,
      usageCount: 0,
    },
  ];

  // 狀態
  let commands = [];
  let selectedCategory = "all";
  let isPanelOpen = false;
  let isFormOpen = false;
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
      if (result.commands && result.commands.length > 0) {
        commands = result.commands;
      } else {
        commands = DEFAULT_COMMANDS;
        await saveCommands();
      }
    } catch (e) {
      commands = DEFAULT_COMMANDS;
    }
    renderCommandList();
  }

  // 儲存指令資料
  async function saveCommands() {
    try {
      await chrome.storage.local.set({ commands });
    } catch (e) {
      console.error("Failed to save commands:", e);
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
        <button class="cmd-panel-add-btn" id="cmd-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
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
    panel.classList.add("open");
    document.getElementById("cmd-form").classList.remove("open");
    document.getElementById("cmd-list").style.display = "block";
    document.querySelector(".cmd-category-tabs").style.display = "flex";
    updatePanelPosition();
    renderCategoryTabs();
    renderCommandList();
  }

  // 關閉面板
  function closePanel() {
    const panel = document.getElementById("cmd-helper-panel");
    isPanelOpen = false;
    isFormOpen = false;
    panel.classList.remove("open");
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
    let filtered = commands;

    if (selectedCategory === "favorite") {
      filtered = commands.filter((cmd) => cmd.isFavorite);
    } else if (selectedCategory !== "all") {
      filtered = commands.filter((cmd) => cmd.categoryId === selectedCategory);
    }

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
      <div class="cmd-item" data-id="${cmd.id}">
        <div class="cmd-item-title">
          ${cmd.isFavorite ? '<span class="star">★</span>' : ""}
          ${escapeHtml(cmd.title)}
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
        </div>
        <p class="cmd-item-content">${escapeHtml(cmd.content)}</p>
      </div>
    `
      )
      .join("");

    // 綁定點擊事件（複製）
    container.querySelectorAll(".cmd-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (
          e.target.closest(".cmd-edit-btn") ||
          e.target.closest(".cmd-delete-btn")
        ) {
          return;
        }
        e.stopPropagation();
        const id = item.dataset.id;
        const cmd = commands.find((c) => c.id === id);
        if (cmd) {
          copyToClipboard(cmd);
        }
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

    document.getElementById("cmd-list").style.display = "none";
    document.querySelector(".cmd-category-tabs").style.display = "none";
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
