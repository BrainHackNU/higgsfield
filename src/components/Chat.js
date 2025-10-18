import React, { useState } from "react";
import "./Chat.css";


let current={};
const downloadImage = async (imageUrl,filename) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
  }
};

async function copyPicture(url) {
  try {
    // Fetch the image
    const response = await fetch(url);
    const blob = await response.blob();
    // If not PNG, convert to PNG using Canvas
    let pngBlob = blob;
    if (blob.type !== "image/png") {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const pngBlobConverted = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"));
      pngBlob = pngBlobConverted;
    }

    // Copy PNG to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ [pngBlob.type]: pngBlob }),
    ]);

    alert("✅ Image copied to clipboard as PNG!");
  } catch (err) {
    console.error("❌ Clipboard copy failed:", err);
    alert("⚠️ Could not copy image — your browser may not support image clipboard.");
  }
}


function Chat() { 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (replace with backend later)
    setTimeout(() => {
      const fakeResponse = {
        sender: "ai",
        text: "Here’s what I generated for you:",
        // image: "https://picsum.photos/id/" + Math.floor(Math.random()*200)+"/600/400.jpg",
        // video: `https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Interview_with_human_and_animal_psychologist_Gilly_Forrester_-_What_Great_Apes_can_tell_us_about_language_%E2%80%93_The_Royal_Society.webm/Interview_with_human_and_animal_psychologist_Gilly_Forrester_-_What_Great_Apes_can_tell_us_about_language_%E2%80%93_The_Royal_Society.webm.720p.vp9.webm`


        video:`https://upload.wikimedia.org/wikipedia/commons/f/f7/Aythorpe_Roding_CC_v_Terling_CC%2C_Essex%2C_England_Video_1_batsman_clean_bowled_out.webm`,
      };

      Object.assign(current,fakeResponse);
    //   console.log(fakeResponse,current)
      setMessages(() => [fakeResponse]);
      setLoading(false);
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            {msg.image && <img src={msg.image} alt="generated" />}
            {msg.video && (
              <video controls width="100%">
                <source src={msg.video} type="video/mp4" />
              </video>
            )}
          </div>
        ))} */}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              {msg.image && <img src={msg.image} alt="generated" />}
              {msg.video && (
                <video controls width="100%">
                  <source src={current.video} type="video/mp4" />
                </video>
              )}
            </div>
{/* /* onClick={() => navigator.clipboard.write()}*/}
            {/* Message toolbar */}
            <div className="message-toolbar">
              {msg.text && (
                <button onClick={() => copyPicture(current.image)} > 
                  📋 Copy
                </button>
              )}
              {msg.image && (
                <button
                  onClick={() => {
                    downloadImage(current.image,"image.png")
                  }}
                >
                  💾 Download
                </button>
              )}
              {msg.video && (
                <button
                  onClick={() => {
                   downloadImage(current.video,"video.mp4");
                  }}
                >
                  💾 Download
                </button>
              )}
              <button
                onClick={() =>
                  navigator.share
                    ? navigator.share({
                        text: msg.text || "Generated content",
                        url: current.image || current.video,
                      })
                    : alert("Sharing not supported on this device.")
                }
              >
                🔗 Share
              </button>
              <button onClick={() => alert("Saved to favorites!")}>
                ❤️ Save
              </button>
            </div>
          </div>
        ))}

        {loading && <div className="message ai">⏳ Generating...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Describe your idea..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={loading}>
          Generate
        </button>
      </div>
    </div>
  );
}

export default Chat;
