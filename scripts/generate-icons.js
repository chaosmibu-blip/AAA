const fs = require('fs');
const path = require('path');

// 簡單的 PNG 生成器（生成純色圓形圖標）
function createPNG(size) {
  // PNG 文件結構
  const width = size;
  const height = size;

  // 創建像素數據（RGBA）
  const pixels = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = (size / 2) - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        // 灰色圓形 #6B7280
        pixels.push(107, 114, 128, 255); // RGBA
      } else {
        // 透明背景
        pixels.push(0, 0, 0, 0);
      }
    }
  }

  // 簡化版：使用 PPM 格式然後轉換...
  // 實際上，讓我們用 data URI 方式
  return Buffer.from(pixels);
}

// 創建一個簡單的 1x1 灰色 PNG 作為佔位符
// 真正的圖標需要用 generate-icons.html 生成

const placeholder = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

console.log('請使用 extension/icons/generate-icons.html 生成正確的圖標');
console.log('在瀏覽器中打開該文件，下載 3 個 PNG 檔案，放入 extension/icons/ 資料夾');
