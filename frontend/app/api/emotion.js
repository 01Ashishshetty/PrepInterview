export async function detectEmotion(filePath, signal) {
    const response = await fetch("http://localhost:8501/emotion/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_path: filePath }),
      signal,
    });
  
    return response.json();
  };
  