import { Readability } from "@mozilla/readability"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

function extractPageText(): string[] {
  const documentClone = document.cloneNode(true) as Document
  const reader = new Readability(documentClone)
  const article = reader.parse()

  if (!article?.textContent) {
    return []
  }

  return article.textContent.split(/\s+/).filter((w) => w.length > 0)
}

function createOverlay(words: string[], wpm: number) {
  let currentIndex = 0
  let isPlaying = false
  let currentWpm = wpm
  let intervalId: ReturnType<typeof setInterval> | null = null

  const overlay = document.createElement("div")
  overlay.id = "speed-read-overlay"
  overlay.style.cssText = `
    position: fixed; top: 32px; left: 50%; transform: translateX(-50%);
    z-index: 2147483647; width: 500px; background: #111827; color: white;
    border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif; user-select: none;
  `

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #374151">
      <span style="font-size:14px;font-weight:500;color:#9ca3af">Speed Read</span>
      <button id="sr-close" style="background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;line-height:1">&times;</button>
    </div>
    <div id="sr-word" style="display:flex;align-items:center;justify-content:center;height:128px;padding:0 32px;font-size:36px;font-weight:bold;letter-spacing:0.05em"></div>
    <div style="height:4px;background:#374151;margin:0 16px;border-radius:9999px;overflow:hidden">
      <div id="sr-progress" style="height:100%;background:#3b82f6;transition:width 100ms;width:0%"></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 16px">
      <button id="sr-back" style="padding:4px 12px;background:#374151;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">-10</button>
      <button id="sr-play" style="padding:4px 12px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;min-width:70px;font-weight:500">Start</button>
      <button id="sr-reset" style="padding:4px 12px;background:#374151;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">Reset</button>
      <button id="sr-fwd" style="padding:4px 12px;background:#374151;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">+10</button>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:0 16px 8px">
      <input id="sr-wpm" type="range" min="100" max="1000" step="25" value="${currentWpm}" style="flex:1;accent-color:#3b82f6">
      <span id="sr-wpm-label" style="font-size:14px;color:#9ca3af;width:80px;text-align:right">${currentWpm} WPM</span>
    </div>
    <div id="sr-pos" style="text-align:center;font-size:12px;color:#6b7280;padding-bottom:12px"></div>
  `

  document.body.appendChild(overlay)

  const wordEl = document.getElementById("sr-word")!
  const progressEl = document.getElementById("sr-progress")!
  const posEl = document.getElementById("sr-pos")!
  const playBtn = document.getElementById("sr-play")!
  const wpmInput = document.getElementById("sr-wpm") as HTMLInputElement
  const wpmLabel = document.getElementById("sr-wpm-label")!

  function updateDisplay() {
    wordEl.textContent = words[currentIndex] || ""
    const pct =
      words.length > 1 ? (currentIndex / (words.length - 1)) * 100 : 100
    progressEl.style.width = pct + "%"
    posEl.textContent = `${currentIndex + 1} / ${words.length}`
  }

  function startInterval() {
    stopInterval()
    intervalId = setInterval(() => {
      if (currentIndex >= words.length - 1) {
        isPlaying = false
        playBtn.textContent = "Play"
        stopInterval()
        return
      }
      currentIndex++
      updateDisplay()
    }, 60000 / currentWpm)
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  updateDisplay()

  document.getElementById("sr-close")!.onclick = () => {
    stopInterval()
    overlay.remove()
  }

  playBtn.onclick = () => {
    isPlaying = !isPlaying
    playBtn.textContent = isPlaying ? "Pause" : "Play"
    if (isPlaying) {
      startInterval()
    } else {
      stopInterval()
    }
  }

  document.getElementById("sr-reset")!.onclick = () => {
    currentIndex = 0
    isPlaying = false
    playBtn.textContent = "Play"
    stopInterval()
    updateDisplay()
  }

  document.getElementById("sr-back")!.onclick = () => {
    currentIndex = Math.max(0, currentIndex - 10)
    updateDisplay()
  }

  document.getElementById("sr-fwd")!.onclick = () => {
    currentIndex = Math.min(words.length - 1, currentIndex + 10)
    updateDisplay()
  }

  wpmInput.oninput = () => {
    currentWpm = Number(wpmInput.value)
    wpmLabel.textContent = currentWpm + " WPM"
    if (isPlaying) {
      startInterval()
    }
  }
}

// Listen for messages from popup - registered immediately at module level
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SPEED_READ_TOGGLE") {
    const existing = document.getElementById("speed-read-overlay")
    if (existing) {
      existing.remove()
      return
    }

    const wpm = message.wpm || 300
    const words = extractPageText()

    if (words.length === 0) {
      // Show a brief error overlay
      const errDiv = document.createElement("div")
      errDiv.id = "speed-read-overlay"
      errDiv.style.cssText = `
        position:fixed;top:32px;left:50%;transform:translateX(-50%);z-index:2147483647;
        width:500px;background:#111827;color:white;border-radius:16px;
        box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;
        user-select:none;padding:24px;text-align:center;
      `
      errDiv.innerHTML = `
        <p style="color:#d1d5db;margin-bottom:12px">Could not extract readable content from this page.</p>
        <button id="sr-err-close" style="padding:6px 16px;background:#374151;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">Close</button>
      `
      document.body.appendChild(errDiv)
      document.getElementById("sr-err-close")!.onclick = () => errDiv.remove()
      return
    }

    createOverlay(words, wpm)
  }
})
