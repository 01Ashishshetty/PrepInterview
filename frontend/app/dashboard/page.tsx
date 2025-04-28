"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { detectEyeContact } from "../api/eyeContact";
import { processAudio } from "../api/audio";
import { detectEmotion } from "../api/emotion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [eyeContactResult, setEyeContactResult] = useState<any>(null); // Allow any type for flexibility
  const [emotionResult, setEmotionResult] = useState<any>(null);
  const [audioResult, setAudioResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Prevent multiple calls
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null); // Store the backend file path
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add error state

  const [applyEyeContact, setApplyEyeContact] = useState(true);
  const [applyEmotion, setApplyEmotion] = useState(true);
  const [applyAudio, setApplyAudio] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analyzeButtonRef = useRef<HTMLButtonElement | null>(null); // Ref for the button
  const abortControllerRef = useRef<AbortController | null>(null); // Ref for AbortController

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setLoadingFile(true);
      setTimeout(() => {
        setFile(selectedFile);
        setLoadingFile(false);
      }, 1000); // Simulating file load time
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setLoadingFile(true);
      setTimeout(() => {
        setFile(uploadedFile);
        setLoadingFile(false);
      }, 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [], "audio/*": [] }, // Allow audio files as well for testing
    maxSize: 200 * 1024 * 1024,
  });

  const handleRemoveFile = () => {
    // Abort any ongoing analysis
    if (isAnalyzing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
      setLoading(false);
    }

    // Reset all states to fresh start
    setFile(null);
    setEyeContactResult(null);
    setEmotionResult(null);
    setAudioResult(null);
    setFeedback("");
    setLoading(false);
    setIsAnalyzing(false);
    setUploadedFilePath(null);
    setErrorMessage(null); // Clear error message

    // Refresh the page
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const uploadFileToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8501/upload/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error details
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.file_path; // Backend returns the saved file path
    } catch (error) {
      console.error("❌ [ERROR] File upload failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error during upload");
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) {
      alert(isAnalyzing ? "Analysis is already in progress." : "Please upload a video first.");
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setErrorMessage(null); // Clear previous errors
    abortControllerRef.current = new AbortController(); // Create new AbortController

    let eyeContactData = null;
    let emotionData = null;
    let audioData = null;

    try {
      // Upload file to backend
      const filePath = await uploadFileToBackend(file);
      setUploadedFilePath(filePath);
      console.log("File uploaded to:", filePath);

      console.log("Starting Analysis for:", filePath, {
        eye_contact: applyEyeContact ? eyeContactResult : null,
        emotion: applyEmotion ? emotionResult : null,
        audio: applyAudio ? audioResult : null,
      });

      if (applyEyeContact) {
        eyeContactData = await detectEyeContact(filePath, abortControllerRef.current.signal);
        console.log("Raw Eye Contact Result:", eyeContactData);
        setEyeContactResult(eyeContactData);
      }

      if (applyEmotion) {
        emotionData = await detectEmotion(filePath, abortControllerRef.current.signal);
        console.log("Raw Emotion Result:", emotionData);
        setEmotionResult(emotionData);
      }

      if (applyAudio) {
        audioData = await processAudio(filePath, abortControllerRef.current.signal);
        console.log("Raw Audio Result from processAudio:", audioData);
        if (!audioData || !audioData.stutter_detection) {
          console.error("❌ [ERROR] Audio analysis returned invalid data:", audioData);
          audioData = { stutter_detection: { nonstutter: 0, repetition: 0, prolongation: 0, blocks: 0 }, transcribed_text: "", summary: "", feedback: "No stutter data available" };
        }
        setAudioResult(audioData);
      }

      if (applyAudio) {
        const response = await fetch("http://127.0.0.1:8501/audio/", {
          method: "POST",
          body: JSON.stringify({ file_path: filePath }),
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal, // Pass signal to abort fetch
        });

        if (!response.ok) {
          console.error(`❌ [ERROR] Server returned: ${response.status} for audio API`);
          audioData = { stutter_detection: { nonstutter: 0, repetition: 0, prolongation: 0, blocks: 0 }, transcribed_text: "", summary: "", feedback: `API error: ${response.status}` };
        } else {
          const data = await response.json();
          console.log("✅ [INFO] Audio API Response:", data);
          setAudioResult(data); // Update audioResult with the API response
          setFeedback(data.feedback || "");
        }
      }
    } catch (error) {
      // Type the error to handle AbortError specifically
      if (error instanceof Error && error.name === "AbortError") {
        console.log("✅ [INFO] Analysis aborted successfully.");
      } else {
        console.error("❌ [ERROR] Analysis failed:", error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
        setIsAnalyzing(false);
      }
      abortControllerRef.current = null; // Clean up AbortController
    }
  };

  // Debounce button clicks to prevent double triggers
  const handleButtonClick = () => {
    if (analyzeButtonRef.current && !analyzeButtonRef.current.disabled) {
      handleAnalyze();
    }
  };

  // Reset UI on mount or state changes if needed
  useEffect(() => {
    // Optional: Add any additional reset logic here if required
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <div
        className={`${sidebarOpen ? "w-1/5" : "w-0"} bg-[#15265f] text-white transition-all duration-300 relative pt-10 overflow-hidden`}
        onMouseEnter={() => setShowButton(true)}
        onMouseLeave={() => setShowButton(false)}
      >
        {sidebarOpen && (
          <div className="p-6">
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
              <Link href="/">
                <Image
                  src="/images/interv-removebg.png"
                  alt="PrepInterview Logo"
                  width={180}
                  height={80}
                  className="cursor-pointer"
                />
              </Link>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-3">Upload Video</h2>
            <p className="text-sm mb-2">Choose a video...</p>

            <div
              {...getRootProps()}
              className={`bg-[#101b35] border-2 border-dashed p-4 rounded-lg cursor-pointer ${isDragActive ? "border-blue-500" : "border-gray-400"}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-blue-400">Drop the video here...</p>
              ) : (
                <p>Drag & drop a file here, or click to select one.</p>
              )}
              <p className="text-sm text-gray-400">MP4, MOV, AVI • Max 200MB</p>
            </div>

            <div className="mt-2 flex justify-center">
              <button
                onClick={handleBrowseClick}
                className="mt-2 w-40 bg-[#274abe] text-white py-2 rounded-xl hover:opacity-70"
              >
                Browse File
              </button>
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {loadingFile && <p className="mt-2 text-yellow-400">Loading...</p>}

            {file && (
              <div className="mt-2 flex items-center bg-[#101b35] p-2 rounded-lg shadow-md w-full overflow-hidden">
                <span className="text-blue-400 mr-3">📹</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-green-300 font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button onClick={handleRemoveFile} className="text-red-500 ml-2">
                  ✖
                </button>
              </div>
            )}

            {errorMessage && <p className="mt-2 text-red-400">{errorMessage}</p>}

            <h3 className="mt-7">Or choose from example videos below:</h3>
            <select className="w-full mt-2 p-3 rounded bg-gray-900 text-white">
              <option>videos/Test_video.mp4</option>
            </select>

            <h3 className="mt-7 text-xl font-semibold">Select Models to Apply</h3>
            <div className="space-y-2 mt-2 text-m">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={applyEyeContact}
                  onChange={() => setApplyEyeContact(!applyEyeContact)}
                />
                Eye Contact Detection
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={applyEmotion}
                  onChange={() => setApplyEmotion(!applyEmotion)}
                />
                Emotion Detection
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={applyAudio}
                  onChange={() => setApplyAudio(!applyAudio)}
                />
                Audio Processing
              </label>
            </div>

            <button
              ref={analyzeButtonRef}
              className="mt-4 w-40 bg-[#15265f] border border-[#274abe] text-white py-2 rounded-xl hover:opacity-70"
              onClick={handleButtonClick}
              disabled={!file || loading}
            >
              {loading ? "Analyzing..." : "Analyze Video"}
            </button>
          </div>
        )}

        {sidebarOpen && showButton && (
          <button
            className="absolute top-4 right-4 bg-[#0e1c4a] text-white p-2 rounded opacity-70 hover:opacity-100 transition-all duration-200"
            onClick={() => setSidebarOpen(false)}
          >
            {"<"}
          </button>
        )}
      </div>

      {!sidebarOpen && (
        <button
          className="absolute top-4 left-4 bg-blue-950 text-white p-2 rounded opacity-70 hover:opacity-100 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
        >
          {">"}
        </button>
      )}

      <div className="flex-1 flex flex-col items-center bg-[#101b35] justify-center text-white pb-60 overflow-y-auto">
        {!sidebarOpen && (
          <div className="absolute top-4 right-4">
            <Image
              src="/images/interv-removebg.png"
              alt="PrepInterview Logo"
              width={200}
              height={80}
            />
          </div>
        )}

        <div className="mt-8 w-[800px]">
          <h3 className="text-left text-xl font-semibold">Video Playback</h3>
          {file ? (
            <video controls className="w-full h-[450px] object-cover rounded-lg mt-2">
              <source src={URL.createObjectURL(file)} type="video/mp4" />
            </video>
          ) : (
            <img
              src="/images/video-interview-platform.png"
              alt="Illustration"
              className="w-full h-[450px] object-cover rounded-lg mt-2"
            />
          )}
        </div>

        {loading && <p className="mt-6 text-yellow-400">Processing video...</p>}
        {errorMessage && <p className="mt-6 text-red-400">{errorMessage}</p>}

        {/* Eye Contact Analysis */}
        {eyeContactResult && (
          <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
            <h2 className="text-lg font-bold">Eye Contact Analysis</h2>
            {eyeContactResult.eye_contact_analysis && (
              <ul className="list-disc pl-5 mt-2">
                {isNaN(eyeContactResult.eye_contact_analysis.Contact) ? (
                  <li>Not contact: 100.00%</li>
                ) : (
                  <>
                    <li>
                      Contact: {(eyeContactResult.eye_contact_analysis.Contact / 100).toFixed(2)}%
                    </li>
                    {100 - (eyeContactResult.eye_contact_analysis.Contact / 100) > 0 && (
                      <li>
                        Not contact: {(100 - (eyeContactResult.eye_contact_analysis.Contact / 100)).toFixed(2)}%
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <h3 className="text-md font-semibold">Recommendations for eye contact</h3>
              {/* <p>Rate limit exceeded. Please check your OpenAI plan and billing details.</p> */}
              <p>...</p>
            </div>
          </div>
        )}

        {/* Emotion Recognition */}
        {emotionResult && (
          <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
            <h2 className="text-lg font-bold">Emotion Recognition</h2>
            {emotionResult.emotion_analysis && (
              <ul className="list-disc pl-5 mt-2">
                {emotionResult.emotion_analysis.neutral / 100 > 0 && (
                  <li>Neutral: {(emotionResult.emotion_analysis.neutral / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.sad / 100 > 0 && (
                  <li>Sad: {(emotionResult.emotion_analysis.sad / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.angry / 100 > 0 && (
                  <li>Angry: {(emotionResult.emotion_analysis.angry / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.disgust / 100 > 0 && (
                  <li>Disgust: {(emotionResult.emotion_analysis.disgust / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.happy / 100 > 0 && (
                  <li>Happy: {(emotionResult.emotion_analysis.happy / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.fear / 100 > 0 && (
                  <li>Fear: {(emotionResult.emotion_analysis.fear / 100).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.surprise / 100 > 0 && (
                  <li>Surprise: {(emotionResult.emotion_analysis.surprise / 100).toFixed(2)}%</li>
                )}
              </ul>
            )}
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <h3 className="text-md font-semibold">Recommendations for eye contact</h3>
              {/* <p>Rate limit exceeded. Please check your OpenAI plan and billing details.</p> */}
              <p>...</p>
            </div>
          </div>
        )}

        {/* Audio Analysis */}
        {audioResult && (
          <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
            <h2 className="text-lg font-bold">Stutter Detection Report</h2>
            {audioResult.stutter_detection && (
              <ul className="list-disc pl-5 mt-2">
                <li>
                  Nonstutter: {(audioResult.stutter_detection.nonstutter * 100 || 0).toFixed(2)}%
                </li>
                <li>
                  Repetition: {(audioResult.stutter_detection.repetition * 100 || 0).toFixed(2)}%
                </li>
                <li>
                  Prolongation: {(audioResult.stutter_detection.prolongation * 100 || 0).toFixed(2)}%
                </li>
                <li>
                  Blocks: {(audioResult.stutter_detection.blocks * 100 || 0).toFixed(2)}%
                </li>
              </ul>
            ) || (
              <p className="text-red-400">No stutter detection data available. Check backend logs.</p>
            )}
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <h3 className="text-md font-semibold">Recommendations for stutter detection</h3>
              <p>{feedback || "No feedback available"}</p>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-bold">Transcribed Text</h2>
              <p className="mt-2">{audioResult.transcribed_text || "No transcription available"}</p>
              <h2 className="text-lg font-bold mt-4">Main Topics:</h2>
              <p>{audioResult.summary || "No summary available"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}















































































































// "use client";

// import { useRef, useState, useCallback, useEffect } from "react";
// import { useDropzone } from "react-dropzone";
// import { detectEyeContact } from "../api/eyeContact";
// import { processAudio } from "../api/audio";
// import { detectEmotion } from "../api/emotion";
// import Image from "next/image";
// import Link from "next/link";

// // Define TypeScript interfaces for API responses
// interface EyeContactResult {
//   eye_contact_analysis: {
//     Contact: number;
//   };
// }

// interface EmotionResult {
//   emotion_analysis: {
//     neutral: number;
//     sad: number;
//     angry: number;
//     disgust: number;
//     happy: number;
//     fear: number;
//     surprise: number;
//   };
// }

// interface AudioResult {
//   stutter_detection: {
//     nonstutter: number;
//     repetition: number;
//     prolongation: number;
//     blocks: number;
//   };
//   transcribed_text: string;
//   summary: string;
//   feedback: string;
// }

// export default function Home() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [showButton, setShowButton] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [eyeContactResult, setEyeContactResult] = useState<EyeContactResult | null>(null);
//   const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null);
//   const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
//   const [loadingState, setLoadingState] = useState<"idle" | "uploading" | "analyzing" | "error">("idle");
//   const [feedback, setFeedback] = useState("");
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const [applyEyeContact, setApplyEyeContact] = useState(true);
//   const [applyEmotion, setApplyEmotion] = useState(true);
//   const [applyAudio, setApplyAudio] = useState(true);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const analyzeButtonRef = useRef<HTMLButtonElement | null>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0] || null;
//     if (selectedFile) {
//       setLoadingState("uploading");
//       setFile(selectedFile);
//       setLoadingState("idle");
//     }
//   };

//   const handleBrowseClick = () => {
//     fileInputRef.current?.click();
//   };

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     if (acceptedFiles.length > 0) {
//       const uploadedFile = acceptedFiles[0];
//       setLoadingState("uploading");
//       setFile(uploadedFile);
//       setLoadingState("idle");
//     }
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "video/*": [], "audio/*": [] },
//     maxSize: 200 * 1024 * 1024,
//   });

//   const handleRemoveFile = () => {
//     if (isAnalyzing && abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       setIsAnalyzing(false);
//       setLoadingState("idle");
//     }

//     setFile(null);
//     setEyeContactResult(null);
//     setEmotionResult(null);
//     setAudioResult(null);
//     setFeedback("");
//     setLoadingState("idle");
//     setIsAnalyzing(false);
//     setUploadedFilePath(null);
//     setErrorMessage(null);
//   };

//   const uploadFileToBackend = async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch("http://127.0.0.1:8501/upload/upload/", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to upload the file. Please try again.");
//       }

//       const data = await response.json();
//       return data.file_path;
//     } catch (error) {
//       setErrorMessage("Failed to upload the file. Please check your connection and try again.");
//       throw error;
//     }
//   };

//   const handleAnalyze = async () => {
//     if (!file || isAnalyzing) {
//       alert(isAnalyzing ? "Analysis is already in progress." : "Please upload a video first.");
//       return;
//     }

//     setLoadingState("analyzing");
//     setIsAnalyzing(true);
//     setErrorMessage(null);
//     abortControllerRef.current = new AbortController();

//     let eyeContactData = null;
//     let emotionData = null;
//     let audioData = null;

//     try {
//       const filePath = await uploadFileToBackend(file);
//       setUploadedFilePath(filePath);

//       if (applyEyeContact) {
//         eyeContactData = await detectEyeContact(filePath, abortControllerRef.current.signal);
//         setEyeContactResult(eyeContactData);
//       }

//       if (applyEmotion) {
//         emotionData = await detectEmotion(filePath, abortControllerRef.current.signal);
//         setEmotionResult(emotionData);
//       }

//       if (applyAudio) {
//         audioData = await processAudio(filePath, abortControllerRef.current.signal);
//         if (!audioData || !audioData.stutter_detection) {
//           audioData = {
//             stutter_detection: { nonstutter: 0, repetition: 0, prolongation: 0, blocks: 0 },
//             transcribed_text: "",
//             summary: "",
//             feedback: "No stutter data available",
//           };
//         }
//         setAudioResult(audioData);
//         setFeedback(audioData.feedback || "");
//       }
//     } catch (error) {
//       if (error instanceof Error && error.name === "AbortError") {
//         console.log("Analysis aborted successfully.");
//       } else {
//         setErrorMessage("Analysis failed. Please try again.");
//       }
//     } finally {
//       if (!abortControllerRef.current?.signal.aborted) {
//         setLoadingState("idle");
//         setIsAnalyzing(false);
//       }
//       abortControllerRef.current = null;
//     }
//   };

//   const handleButtonClick = () => {
//     if (analyzeButtonRef.current && !analyzeButtonRef.current.disabled) {
//       handleAnalyze();
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//         abortControllerRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div className="flex min-h-screen relative">
//       <div
//         className={`${sidebarOpen ? "w-1/5" : "w-0"} bg-[#15265f] text-white transition-all duration-300 relative pt-10 overflow-hidden`}
//         onMouseEnter={() => setShowButton(true)}
//         onMouseLeave={() => setShowButton(false)}
//       >
//         {sidebarOpen && (
//           <div className="p-6">
//             <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
//               <Link href="/">
//                 <Image
//                   src="/images/interv-removebg.png"
//                   alt="PrepInterview Logo"
//                   width={180}
//                   height={80}
//                   className="cursor-pointer"
//                   style={{ objectFit: "contain" }}
//                 />
//               </Link>
//             </div>

//             <h2 className="text-xl font-semibold mb-4 mt-3">Upload Video</h2>
//             <p className="text-sm mb-2">Choose a video...</p>

//             <div
//               {...getRootProps()}
//               className={`bg-[#101b35] border-2 border-dashed p-4 rounded-lg cursor-pointer ${
//                 isDragActive ? "border-blue-500" : "border-gray-400"
//               }`}
//             >
//               <input {...getInputProps()} />
//               {isDragActive ? (
//                 <p className="text-blue-400">Drop the video here...</p>
//               ) : (
//                 <p>Drag & drop a file here, or click to select one.</p>
//               )}
//               <p className="text-sm text-gray-400">MP4, MOV, AVI • Max 200MB</p>
//             </div>

//             <div className="mt-2 flex justify-center">
//               <button
//                 onClick={handleBrowseClick}
//                 className="mt-2 w-40 bg-[#274abe] text-white py-2 rounded-xl hover:opacity-70"
//               >
//                 Browse File
//               </button>
//               <input
//                 type="file"
//                 accept="video/*"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//             </div>

//             {loadingState === "uploading" && <p className="mt-2 text-yellow-400">Loading...</p>}

//             {file && (
//               <div className="mt-2 flex items-center bg-[#101b35] p-2 rounded-lg shadow-md w-full overflow-hidden">
//                 <span className="text-blue-400 mr-3">📹</span>
//                 <div className="flex-1 overflow-hidden">
//                   <p className="text-green-300 font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
//                     {file.name}
//                   </p>
//                   <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
//                 </div>
//                 <button onClick={handleRemoveFile} className="text-red-500 ml-2">
//                   ✖
//                 </button>
//               </div>
//             )}

//             {errorMessage && <p className="mt-2 text-red-400">{errorMessage}</p>}

//             <h3 className="mt-7">Or choose from example videos below:</h3>
//             <select className="w-full mt-2 p-3 rounded bg-gray-900 text-white">
//               <option>videos/Test_video.mp4</option>
//             </select>

//             <h3 className="mt-7 text-xl font-semibold">Select Models to Apply</h3>
//             <div className="space-y-2 mt-2 text-m">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={applyEyeContact}
//                   onChange={() => setApplyEyeContact(!applyEyeContact)}
//                 />
//                 Eye Contact Detection
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={applyEmotion}
//                   onChange={() => setApplyEmotion(!applyEmotion)}
//                 />
//                 Emotion Detection
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={applyAudio}
//                   onChange={() => setApplyAudio(!applyAudio)}
//                 />
//                 Audio Processing
//               </label>
//             </div>

//             <button
//               ref={analyzeButtonRef}
//               className="mt-4 w-40 bg-[#15265f] border border-[#274abe] text-white py-2 rounded-xl hover:opacity-70"
//               onClick={handleButtonClick}
//               disabled={
//                 !file ||
//                 loadingState === "analyzing" ||
//                 (!applyEyeContact && !applyEmotion && !applyAudio)
//               }
//             >
//               {loadingState === "analyzing" ? "Analyzing..." : "Analyze Video"}
//             </button>
//           </div>
//         )}

//         {sidebarOpen && showButton && (
//           <button
//             className="absolute top-4 right-4 bg-[#0e1c4a] text-white p-2 rounded opacity-70 hover:opacity-100 transition-all duration-200"
//             onClick={() => setSidebarOpen(false)}
//           >
//             {"<"}
//           </button>
//         )}
//       </div>

//       {!sidebarOpen && (
//         <button
//           className="absolute top-4 left-4 bg-blue-950 text-white p-2 rounded opacity-70 hover:opacity-100 transition-all duration-200"
//           onClick={() => setSidebarOpen(true)}
//         >
//           {">"}
//         </button>
//       )}

//       <div className="flex-1 flex flex-col items-center bg-[#101b35] justify-center text-white pb-60 overflow-y-auto">
//         {!sidebarOpen && (
//           <div className="absolute top-4 right-4">
//             <Image
//               src="/images/interv-removebg.png"
//               alt="PrepInterview Logo"
//               width={200}
//               height={80}
//               style={{ objectFit: "contain" }}
//             />
//           </div>
//         )}

//         <div className="mt-8 w-[800px]">
//           <h3 className="text-left text-xl font-semibold">Video Playback</h3>
//           {file ? (
//             <video controls className="w-full h-[450px] object-cover rounded-lg mt-2">
//               <source src={URL.createObjectURL(file)} type="video/mp4" />
//             </video>
//           ) : (
//             <img
//               src="/images/video-interview-platform.png"
//               alt="Illustration"
//               className="w-full h-[450px] object-cover rounded-lg mt-2"
//             />
//           )}
//         </div>

//         {loadingState === "analyzing" && <p className="mt-6 text-yellow-400">Processing video...</p>}
//         {errorMessage && <p className="mt-6 text-red-400">{errorMessage}</p>}

//         {/* Eye Contact Analysis */}
//         {eyeContactResult && (
//           <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
//             <h2 className="text-lg font-bold">Eye Contact Analysis</h2>
//             {eyeContactResult.eye_contact_analysis && (
//               <ul className="list-disc pl-5 mt-2">
//                 {isNaN(eyeContactResult.eye_contact_analysis.Contact) ? (
//                   <li>Not contact: 100.00%</li>
//                 ) : (
//                   <>
//                     <li>
//                       Contact: {(eyeContactResult.eye_contact_analysis.Contact / 100).toFixed(2)}%
//                     </li>
//                     {100 - eyeContactResult.eye_contact_analysis.Contact / 100 > 0 && (
//                       <li>
//                         Not contact: {(100 - eyeContactResult.eye_contact_analysis.Contact / 100).toFixed(2)}%
//                       </li>
//                     )}
//                   </>
//                 )}
//               </ul>
//             )}
//             <div className="mt-2 p-2 bg-gray-700 rounded">
//               <h3 className="text-md font-semibold">Recommendations for Eye Contact</h3>
//               <p>{feedback || "No recommendations available"}</p>
//             </div>
//           </div>
//         )}

//         {/* Emotion Recognition */}
//         {emotionResult && (
//           <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
//             <h2 className="text-lg font-bold">Emotion Recognition</h2>
//             {emotionResult.emotion_analysis && (
//               <ul className="list-disc pl-5 mt-2">
//                 {emotionResult.emotion_analysis.neutral / 100 > 0 && (
//                   <li>Neutral: {(emotionResult.emotion_analysis.neutral / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.sad / 100 > 0 && (
//                   <li>Sad: {(emotionResult.emotion_analysis.sad / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.angry / 100 > 0 && (
//                   <li>Angry: {(emotionResult.emotion_analysis.angry / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.disgust / 100 > 0 && (
//                   <li>Disgust: {(emotionResult.emotion_analysis.disgust / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.happy / 100 > 0 && (
//                   <li>Happy: {(emotionResult.emotion_analysis.happy / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.fear / 100 > 0 && (
//                   <li>Fear: {(emotionResult.emotion_analysis.fear / 100).toFixed(2)}%</li>
//                 )}
//                 {emotionResult.emotion_analysis.surprise / 100 > 0 && (
//                   <li>Surprise: {(emotionResult.emotion_analysis.surprise / 100).toFixed(2)}%</li>
//                 )}
//               </ul>
//             )}
//             <div className="mt-2 p-2 bg-gray-700 rounded">
//               <h3 className="text-md font-semibold">Recommendations for Emotion</h3>
//               <p>{feedback || "No recommendations available"}</p>
//             </div>
//           </div>
//         )}

//         {/* Audio Analysis */}
//         {audioResult && (
//           <div className="mt-6 p-4 w-[800px] bg-gray-800 rounded-lg text-white">
//             <h2 className="text-lg font-bold">Stutter Detection Report</h2>
//             {audioResult.stutter_detection && (
//               <ul className="list-disc pl-5 mt-2">
//                 <li>Nonstutter: {(audioResult.stutter_detection.nonstutter * 100 || 0).toFixed(2)}%</li>
//                 <li>Repetition: {(audioResult.stutter_detection.repetition * 100 || 0).toFixed(2)}%</li>
//                 <li>Prolongation: {(audioResult.stutter_detection.prolongation * 100 || 0).toFixed(2)}%</li>
//                 <li>Blocks: {(audioResult.stutter_detection.blocks * 100 || 0).toFixed(2)}%</li>
//               </ul>
//             ) || <p className="text-red-400">No stutter detection data available. Check backend logs.</p>}
//             <div className="mt-2 p-2 bg-gray-700 rounded">
//               <h3 className="text-md font-semibold">Recommendations for Stutter Detection</h3>
//               <p>{feedback || "No feedback available"}</p>
//             </div>
//             <div className="mt-4">
//               <h2 className="text-lg font-bold">Transcribed Text</h2>
//               <p className="mt-2">{audioResult.transcribed_text || "No transcription available"}</p>
//               <h2 className="text-lg font-bold mt-4">Main Topics:</h2>
//               <p>{audioResult.summary || "No summary available"}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



















































































































































