import React, { useState, useRef } from "react";
import "./Chat.css";




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
  const [imageUrl, setImageUrl] = useState("");
const [uploadedImage, setUploadedImage] = useState(null);
const [imageFile, setImageFile] = useState(null);
const fileInputRef = useRef(null);
const [model, setModel] = useState("veo-3-fast");
const [aspect, setAspect] = useState("16:9");
const [quality, setQuality] = useState("basic");
const [audioPrompt, setAudioPrompt] = useState("");

const chosenImage =
  imageUrl ||
  uploadedImage ||
  "https://picsum.photos/seed/example/800/450";



  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (replace with backend later)
    // setTimeout(() => {
    //   const fakeResponse = {
    //     sender: "ai",
    //     text: "Here’s what I generated for you:",
    //     // image: "https://picsum.photos/id/" + Math.floor(Math.random()*200)+"/600/400.jpg",
    //     // video: `https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Interview_with_human_and_animal_psychologist_Gilly_Forrester_-_What_Great_Apes_can_tell_us_about_language_%E2%80%93_The_Royal_Society.webm/Interview_with_human_and_animal_psychologist_Gilly_Forrester_-_What_Great_Apes_can_tell_us_about_language_%E2%80%93_The_Royal_Society.webm.720p.vp9.webm`


    //     video:`https://upload.wikimedia.org/wikipedia/commons/f/f7/Aythorpe_Roding_CC_v_Terling_CC%2C_Essex%2C_England_Video_1_batsman_clean_bowled_out.webm`,
    //   };
      

    //   Object.assign(current,fakeResponse);
    // //   console.log(fakeResponse,current)
    //   setMessages(() => [fakeResponse]);
    //   setLoading(false);
    // }, 2000);

    try {
    // 1️⃣ Send POST request to /image2video
    const body = {
  model,
  quality,
  aspect_ratio: aspect,
  seed: Math.floor(Math.random() * 1000000),
  enhance_prompt: true,
  prompt: input,
  audio_prompt: audioPrompt,
  image_url: [chosenImage]
};

    const response = await fetch("https://higgsfield-api-production.up.railway.app/image2video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // console.log("❌ Backend response:", response.status, await response.text());
    if (!response.ok) throw new Error("Request failed");
    const job = await response.json();
    const jobId = job?.jobs?.[0]?.id || job.id;

    // 2️⃣ Poll for video result
    let videoUrl = null;
    for (let i = 0; i < 20; i++) { // try for ~20×3s = 1 minute
      const res = await fetch(`https://higgsfield-api-production.up.railway.app/results/${jobId}`);


      const data = await res.json();

        //   console.log("✅ Job response:", data);


      const resultUrl = data?.jobs?.[0]?.results?.raw?.url;
      if (resultUrl) {
        videoUrl = resultUrl;
        break;
      }

      // wait 3 seconds before next check
      await new Promise((r) => setTimeout(r, 3000));
    }

    // 3️⃣ Show the result or timeout message
    const aiResponse = videoUrl
      ? {
          sender: "ai",
          text: "Here’s your generated video:",
          video: videoUrl,
        }
      : {
          sender: "ai",
          text:
            "Still processing or something went wrong — please check the backend logs.",
        };

    setMessages((prev) => [...prev, aiResponse]);
  } catch (err) {
    // console.error(err);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: "Error contacting backend." },
    ]);
  } finally {
    setLoading(false);
  }
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
        
<div className="chat-messages">
        {messages.map((msg, i) => (
<div key={i} className={`message-wrapper ${msg.sender}`}>
  <div className="message-bubble">
      <p>{msg.text}</p>
      {msg.image && <img src={msg.image} alt="generated" />}
      {msg.video && (
        <video controls width="100%">
          <source src={msg.video} type="video/mp4" />
        </video>
      )}
    </div>

    {/* Toolbar */}
    <div className="message-toolbar">
      {msg.image && (
        <>
          <button onClick={() => copyPicture(msg.image)}>📋 Copy</button>
          <button onClick={() => downloadImage(msg.image, "image.png")}>
            💾 Download
          </button>
        </>
      )}

      {msg.video && (
        <button onClick={() => downloadImage(msg.video, "video.mp4")}>
          💾 Download Video
        </button>
      )}

      <button
        onClick={() =>
          navigator.share
            ? navigator.share({
                text: msg.text || "Generated content",
                url: msg.image || msg.video,
              })
            : alert("Sharing not supported on this device.")
        }
      >
        🔗 Share
      </button>

      <button onClick={() => alert("Saved to favorites!")}>❤️ Save</button>
    </div>
  </div>
))}</div>


        {loading && <div className="message ai">⏳ Generating...</div>}
      </div>

      <div className="chat-input">
  <input
    type="text"
    placeholder="Describe your idea..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}
    className="prompt-input"
  />
    <div className="param-controls">
    <select value={model} onChange={(e) => setModel(e.target.value)}>
      <option value="veo-3-fast">veo-3-fast</option>
      <option value="veo-3-ultra">veo-3</option>
    </select>

    <select value={aspect} onChange={(e) => setAspect(e.target.value)}>
      <option value="16:9">16:9</option>
      <option value="9:16">9:16</option>
    </select>

    <select value={quality} onChange={(e) => setQuality(e.target.value)}>
      <option value="basic">Basic</option>
      <option value="high">High</option>
    </select>

    <input
      type="text"
      placeholder="Audio prompt (optional)"
      value={audioPrompt}
      onChange={(e) => setAudioPrompt(e.target.value)}
    />
  </div>


  <div className="image-controls">
    <input
      type="file"
      id="fileUpload"
      accept="image/*"
      ref={fileInputRef}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setUploadedImage(event.target.result);
            setImageFile(file);
            setImageUrl("");
          };
          reader.readAsDataURL(file);
        }
      }}
    />
    <input
      type="text"
      placeholder="or paste image URL..."
      value={imageUrl}
      onChange={(e) => {
        setImageUrl(e.target.value);
        setUploadedImage(null);

      }}
      className="url-input"
    />
  </div>

  {(uploadedImage || imageUrl) && (
    <div className="image-preview">
      <img src={uploadedImage || imageUrl} alt="preview" />
      <button
        className="clear-btn"
        onClick={() => {
          setUploadedImage(null);
          setImageUrl("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      >
        ✖
      </button>
    </div>
  )}

  <button
    className="send-btn"
    onClick={() => {
      sendMessage();
      // 🧹 clear preview after sending
      setUploadedImage(null);
      setImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    }}
    disabled={loading}
  >
    Send
  </button>
</div>

    </div>
  );
}

export default Chat;
