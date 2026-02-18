import "./style.css"

import { useStorage } from "@plasmohq/storage/hook"

function IndexPopup() {
  const [wpm, setWpm] = useStorage("speed-read-wpm", 300)

  const handleToggle = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "SPEED_READ_TOGGLE",
          wpm
        })
      }
    } catch (err) {
      console.error("Speed Read: Failed to send message to tab", err)
    }
  }

  return (
    <div className="w-72 p-4 bg-gray-900 text-white font-sans">
      <h1 className="text-lg font-bold mb-4">Speed Read</h1>

      <button
        onClick={handleToggle}
        className="w-full py-2 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700">
        Start Reading
      </button>

      <div className="mt-4">
        <label className="text-sm text-gray-400">Speed: {wpm} WPM</label>
        <input
          type="range"
          min={100}
          max={1000}
          step={25}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="w-full mt-1 accent-blue-500"
        />
      </div>
    </div>
  )
}

export default IndexPopup
