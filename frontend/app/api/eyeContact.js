export const detectEyeContact = async (filePath, signal) => {
    const response = await fetch("http://localhost:8501/eye-contact/", {  // Correct backend URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_path: filePath }),
      signal,
    });
  
    return response.json();
  };