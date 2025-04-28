export async function processAudio(filePath, signal) {
    const response = await fetch(`http://127.0.0.1:8501/audio/`, {
      method: "POST",
      body: JSON.stringify({ file_path: filePath }),
      headers: { "Content-Type": "application/json" },
      signal, // Pass the abort signal
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }