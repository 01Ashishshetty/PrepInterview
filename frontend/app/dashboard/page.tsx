"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { detectEyeContact } from "../api/eyeContact";
import { processAudio } from "../api/audio";
import { detectEmotion } from "../api/emotion";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

interface AnalysisResult {
  emotion_analysis?: { sad: number; happy: number; angry: number; disgust: number; surprise: number; fear: number; neutral: number };
  eye_contact_analysis?: { Contact: number };
  stutter_detection?: { nonstutter: number; repetition: number; prolongation: number; blocks: number };
  transcribed_text?: string;
  summary?: string;
  recommendations?: string;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string | null>(null);
  const [eyeContactResult, setEyeContactResult] = useState<AnalysisResult>({});
  const [emotionResult, setEmotionResult] = useState<AnalysisResult>({});
  const [audioResult, setAudioResult] = useState<AnalysisResult>({});
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jsPDF, setJsPDF] = useState<any>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const [applyEyeContact, setApplyEyeContact] = useState(true);
  const [applyEmotion, setApplyEmotion] = useState(true);
  const [applyAudio, setApplyAudio] = useState(true);

  const [eyeContactAnalysisDone, setEyeContactAnalysisDone] = useState(false);
  const [emotionAnalysisDone, setEmotionAnalysisDone] = useState(false);
  const [audioAnalysisDone, setAudioAnalysisDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analyzeButtonRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadJsPDF = async () => {
        try {
          const jspdfModule = await import("jspdf");
          const JSPDFConstructor = jspdfModule.default || jspdfModule.jsPDF;
          if (!JSPDFConstructor) {
            throw new Error("jsPDF constructor not found in module.");
          }
          setJsPDF(() => JSPDFConstructor);
        } catch (error) {
          console.error("Failed to load jsPDF:", error);
          setErrorMessage("Failed to load PDF generator. Please try again later.");
        }
      };
      loadJsPDF();
    }
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/images/interv1-removebg.png");
        if (!response.ok) {
          throw new Error("Failed to fetch logo image");
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.onerror = () => {
          console.error("Error reading logo image");
          setErrorMessage("Failed to load logo image for PDF generation.");
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading logo:", error);
        setErrorMessage("Failed to load logo image for PDF generation.");
      }
    };
    loadLogo();
  }, []);

  const downloadCombinedReportAsPDF = () => {
    if (!jsPDF) {
      console.error("jsPDF not loaded yet.");
      setErrorMessage("PDF generator not loaded. Please try again.");
      return;
    }

    if (!logoBase64) {
      console.error("Logo not loaded yet.");
      setErrorMessage("Logo image not loaded. Please try again.");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 25;
      let yPosition = 15;

      const logoWidth = 68;
      const logoHeight = 15;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoBase64, "PNG", logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 10;

      const addText = (text: string, x: number, fontSize: number, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        for (const line of lines) {
          if (yPosition + fontSize / 2 > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, x, yPosition);
          yPosition += fontSize / 2.5;
        }
      };

      const addDivider = () => {
        if (yPosition + 5 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setDrawColor(150, 150, 150);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      };

      addText("Interview Analysis Report", margin, 18, true);
      yPosition -= 1;
      addText(`Generated on: ${new Date().toLocaleString()}`, margin, 10);
      yPosition += 12;

      if (eyeContactResult.eye_contact_analysis) {
        addText("Eye Contact Analysis", margin, 14, true);
        yPosition += 1;
        if (isNaN(eyeContactResult.eye_contact_analysis.Contact)) {
          addText("- Not Contact: 100.00%", margin + 5, 12);
        } else {
          addText(`- Contact: ${eyeContactResult.eye_contact_analysis.Contact.toFixed(2)}%`, margin + 5, 12);
          if (100 - eyeContactResult.eye_contact_analysis.Contact > 0) {
            addText(`- Not Contact: ${(100 - eyeContactResult.eye_contact_analysis.Contact).toFixed(2)}%`, margin + 5, 12);
          }
        }
        yPosition += 2;
        addText("Recommendations:", margin, 12, true);
        yPosition += 1;
        addText(eyeContactResult.recommendations || "No recommendations available", margin + 5, 12);
        yPosition += 3;
        addDivider();
        yPosition += 1;
      }

      if (emotionResult.emotion_analysis) {
        addText("Emotion Recognition", margin, 14, true);
        yPosition += 1;
        if (emotionResult.emotion_analysis.neutral > 0) addText(`- Neutral: ${emotionResult.emotion_analysis.neutral.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.sad > 0) addText(`- Sad: ${emotionResult.emotion_analysis.sad.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.angry > 0) addText(`- Angry: ${emotionResult.emotion_analysis.angry.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.disgust > 0) addText(`- Disgust: ${emotionResult.emotion_analysis.disgust.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.happy > 0) addText(`- Happy: ${emotionResult.emotion_analysis.happy.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.fear > 0) addText(`- Fear: ${emotionResult.emotion_analysis.fear.toFixed(2)}%`, margin + 5, 12);
        if (emotionResult.emotion_analysis.surprise > 0) addText(`- Surprise: ${emotionResult.emotion_analysis.surprise.toFixed(2)}%`, margin + 5, 12);
        yPosition += 2;
        addText("Recommendations:", margin, 12, true);
        yPosition += 1;
        addText(emotionResult.recommendations || "No recommendations available", margin + 5, 12);
        yPosition += 3;
        addDivider();
        yPosition += 1;
      }

      if (audioResult.stutter_detection) {
        addText("Stutter Detection Report", margin, 14, true);
        yPosition += 1;
        addText(`- Nonstutter: ${(audioResult.stutter_detection.nonstutter || 0).toFixed(2)}%`, margin + 5, 12);
        addText(`- Repetition: ${(audioResult.stutter_detection.repetition || 0).toFixed(2)}%`, margin + 5, 12);
        addText(`- Prolongation: ${(audioResult.stutter_detection.prolongation || 0).toFixed(2)}%`, margin + 5, 12);
        addText(`- Blocks: ${(audioResult.stutter_detection.blocks || 0).toFixed(2)}%`, margin + 5, 12);
        yPosition += 2;
        addText("Recommendations:", margin, 12, true);
        yPosition += 1;
        addText(audioResult.recommendations || "No recommendations available", margin + 5, 12);
        yPosition += 5;

        addText("Transcribed Text:", margin, 12, true);
        yPosition += 1;
        addText(audioResult.transcribed_text || "No transcription available", margin + 5, 12);
        yPosition += 5;

        addText("Main Topics:", margin, 12, true);
        yPosition += 1;
        addText(audioResult.summary || "No summary available", margin + 5, 12);
        yPosition += 3;
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        const borderMargin = 10;
        doc.rect(
          borderMargin,
          borderMargin,
          pageWidth - 2 * borderMargin,
          pageHeight - 2 * borderMargin,
          "S"
        );

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, pageHeight - 10);
      }

      const date = new Date().toISOString().split("T")[0];
      doc.save(`PrepInterview_Report_${date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setErrorMessage("Failed to generate PDF. Please try again.");
    }
  };

  const startRecording = async () => {
    if (isAnalyzing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
      setLoading(false);
    }
    setFile(null);
    setRecordedFile(null);
    setDisplayedFileName(null);
    setEyeContactResult({});
    setEmotionResult({});
    setAudioResult({});
    setLoading(false);
    setIsAnalyzing(false);
    setUploadedFilePath(null);
    setErrorMessage(null);
    setEyeContactAnalysisDone(false);
    setEmotionAnalysisDone(false);
    setAudioAnalysisDone(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
          setErrorMessage("Failed to play video feed. Please check your webcam.");
        });
      } else {
        throw new Error("Video element not found.");
      }

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const recordedFile = new File([blob], "recorded_video.webm", { type: "video/webm" });
        setRecordedFile(recordedFile);
        setFile(recordedFile);
        setDisplayedFileName("recorded_video.webm");

        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setErrorMessage(
        error instanceof Error
          ? `Failed to start recording: ${error.message}. Please ensure webcam and microphone permissions are granted.`
          : "Failed to start recording. Please ensure webcam and microphone permissions are granted."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setLoadingFile(true);
      setTimeout(() => {
        setFile(selectedFile);
        setRecordedFile(null);
        setDisplayedFileName(selectedFile.name);
        setUploadedFilePath(null);
        setLoadingFile(false);
      }, 1000);
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
        setRecordedFile(null);
        setDisplayedFileName(uploadedFile.name);
        setUploadedFilePath(null);
        setLoadingFile(false);
      }, 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [], "audio/*": [] },
    maxSize: 200 * 1024 * 1024,
  });

  const handleRemoveFile = () => {
    if (isAnalyzing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
      setLoading(false);
    }
    setFile(null);
    setRecordedFile(null);
    setDisplayedFileName(null);
    setEyeContactResult({});
    setEmotionResult({});
    setAudioResult({});
    setLoading(false);
    setIsAnalyzing(false);
    setUploadedFilePath(null);
    setErrorMessage(null);
    setEyeContactAnalysisDone(false);
    setEmotionAnalysisDone(false);
    setAudioAnalysisDone(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const uploadFileToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const isRecording = file === recordedFile;
    const url = `http://127.0.0.1:8501/upload/upload/?isRecording=${isRecording}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      const filePath = data.file_path;
      
      const normalizedPath = filePath.replace(/\\/g, '/');
      const fileName = normalizedPath.split('/').pop() || file.name;
      setDisplayedFileName(fileName);
      
      return filePath;
    } catch (error) {
      console.error("File upload failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error during upload");
      throw error;
    }
  };

  const handleAnalyze = async () => {
    const fileToAnalyze = file || recordedFile;
    if (!fileToAnalyze || isAnalyzing) {
      alert(isAnalyzing ? "Analysis is already in progress." : "Please upload or record a video first.");
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setErrorMessage(null);
    abortControllerRef.current = new AbortController();

    setEyeContactAnalysisDone(false);
    setEmotionAnalysisDone(false);
    setAudioAnalysisDone(false);

    try {
      let filePath = uploadedFilePath;
      if (!filePath) {
        filePath = await uploadFileToBackend(fileToAnalyze);
        setUploadedFilePath(filePath);
      } else {
        console.log("File already uploaded, reusing path:", filePath);
      }

      if (applyEyeContact) {
        const eyeContactData = await detectEyeContact(filePath, abortControllerRef.current.signal);
        console.log("Eye Contact Result:", eyeContactData);
        if (eyeContactData.error) {
          throw new Error(`Eye Contact Analysis Error: ${eyeContactData.error}`);
        }
        setEyeContactResult(eyeContactData);
        setEyeContactAnalysisDone(true);
      } else {
        setEyeContactAnalysisDone(true);
      }

      if (applyEmotion) {
        const emotionData = await detectEmotion(filePath, abortControllerRef.current.signal);
        console.log("Emotion Result:", emotionData);
        if (emotionData.error) {
          throw new Error(`Emotion Analysis Error: ${emotionData.error}`);
        }
        setEmotionResult(emotionData);
        setEmotionAnalysisDone(true);
      } else {
        setEmotionAnalysisDone(true);
      }

      if (applyAudio) {
        const audioData = await processAudio(filePath, abortControllerRef.current.signal);
        console.log("Audio Result:", audioData);
        if (audioData.error) {
          throw new Error(`Audio Analysis Error: ${audioData.error}`);
        }
        setAudioResult(audioData);
        setAudioAnalysisDone(true);
      } else {
        setAudioAnalysisDone(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Analysis aborted.");
        setErrorMessage("Analysis was aborted.");
      } else {
        console.error("Analysis failed:", error);
        const errorMsg = error instanceof Error ? error.message : "An error occurred during analysis.";
        console.log("Setting errorMessage to:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
        setIsAnalyzing(false);
      }
      abortControllerRef.current = null;
    }
  };

  const areAllAnalysesComplete = () => {
    return (
      (applyEyeContact ? eyeContactAnalysisDone : true) &&
      (applyEmotion ? emotionAnalysisDone : true) &&
      (applyAudio ? audioAnalysisDone : true)
    );
  };

  return (
    <>
      <Head>
        <title>PrepInterview</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <div className="flex md:flex-row flex-col min-h-screen bg-[#101b35] text-white relative">
        <div
          className={`md:w-1/5 w-full md:bg-[#15265f] bg-[#101b35] transition-transform duration-500 ease-in-out transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } relative pt-10 overflow-hidden`}
          onMouseEnter={() => setShowButton(true)}
          onMouseLeave={() => setShowButton(false)}
        >
          <div className="p-6 w-full max-w-[300px] mx-auto">
            <div className="md:absolute top-5 left-1/2 md:transform md:-translate-x-1/2 mb-4 md:mb-0">
              <Link href="/">
                <Image
                  src="/images/interv-removebg.png"
                  alt="PrepInterview Logo"
                  width={180}
                  height={80}
                  className="cursor-pointer mx-auto"
                />
              </Link>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-3">Upload or Record Video</h2>
            <p className="text-sm mb-2">Choose a video...</p>

            <div
              {...getRootProps()}
              className={`bg-[#101b35] border-2 border-dashed p-4 rounded-lg cursor-pointer ${
                isDragActive ? "border-blue-500" : "border-gray-400"
              }`}
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

            {(file || recordedFile) && (
              <div className="mt-2 flex items-center bg-[#101b35] p-2 rounded-lg shadow-md w-full overflow-hidden">
                <span className="text-blue-400 mr-3">📹</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-green-300 font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {displayedFileName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(() => {
                      const selectedFile = file || recordedFile;
                      return selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "0.00 MB";
                    })()}
                  </p>
                </div>
                <button onClick={handleRemoveFile} className="text-red-500 ml-2">
                  ✖
                </button>
              </div>
            )}

            {errorMessage && <p className="mt-2 text-red-400">{errorMessage}</p>}

            <h3 className="mt-7">Or record a live video:</h3>
            <div className="mt-2 flex justify-center space-x-2">
              <button
                onClick={startRecording}
                className="w-40 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 disabled:opacity-50"
                disabled={isRecording}
              >
                Start
              </button>
              <button
                onClick={stopRecording}
                className="w-40 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 disabled:opacity-95"
                disabled={!isRecording}
              >
                Stop
              </button>
            </div>

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
              onClick={handleAnalyze}
              disabled={!(file || recordedFile) || loading}
            >
              {loading ? "Analyzing..." : "Analyze Video"}
            </button>
          </div>

          {sidebarOpen && showButton && (
            <button
              className="md:block hidden absolute top-4 right-4 bg-[#0e1c4a] text-white p-2 rounded opacity-70 hover:opacity-100 transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => setSidebarOpen(false)}
            >
              {"<"}
            </button>
          )}
        </div>

        {!sidebarOpen && (
          <button
            className="md:block hidden absolute top-4 left-4 bg-blue-950 text-white p-2 rounded opacity-70 hover:opacity-100 transition-transform duration-300 ease-in-out transform hover:scale-110"
            onClick={() => setSidebarOpen(true)}
          >
            {">"}
          </button>
        )}

        <div className="flex-1 flex flex-col items-center bg-[#101b35] text-white pb-20 overflow-y-auto transition-all duration-500 ease-in-out">
          {!sidebarOpen && (
            <div className="md:block hidden absolute top-4 right-4">
              <Image
                src="/images/interv-removebg.png"
                alt="PrepInterview Logo"
                width={200}
                height={80}
              />
            </div>
          )}

          <div className="mt-8 w-full md:w-[800px] px-4">
            <h3 className="text-left text-xl font-semibold">Video Playback</h3>
            <div className={`relative ${isRecording ? "block" : "hidden"}`}>
              <div className="absolute top-2 left-2 flex items-center space-x-2 bg-gray-800 bg-opacity-75 px-2 py-1 rounded">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">Recording...</span>
              </div>
              <video ref={videoRef} className="w-full h-[200px] md:h-[450px] object-cover rounded-lg mt-2" muted autoPlay />
            </div>
            {!isRecording && (file || recordedFile) ? (
              <video controls className="w-full h-[200px] md:h-[450px] object-cover rounded-lg mt-2">
                <source
                  src={URL.createObjectURL((file || recordedFile) as File)}
                  type={(file || recordedFile)?.type || "video/webm"}
                />
                Your browser does not support the video tag.
              </video>
            ) : !isRecording ? (
              <img
                src="/images/video-interview-platform.png"
                alt="Illustration"
                className="w-full h-[200px] md:h-[450px] object-cover rounded-lg mt-2"
              />
            ) : null}
          </div>

          {loading && <p className="mt-6 text-yellow-400">Processing video...</p>}
          {errorMessage && <p className="mt-6 text-red-400">{errorMessage}</p>}

          {eyeContactResult.eye_contact_analysis && (
            <div className="mt-6 w-[90%] max-w-md md:max-w-[800px] mx-auto p-4 bg-gray-800 rounded-lg text-white">
              <h2 className="text-lg font-bold">Eye Contact Analysis</h2>
              <ul className="list-disc pl-5 mt-2">
                {isNaN(eyeContactResult.eye_contact_analysis.Contact) ? (
                  <li>Not contact: 100.00%</li>
                ) : (
                  <>
                    <li>Contact: {(eyeContactResult.eye_contact_analysis.Contact).toFixed(2)}%</li>
                    {100 - eyeContactResult.eye_contact_analysis.Contact > 0 && (
                      <li>Not contact: {(100 - eyeContactResult.eye_contact_analysis.Contact).toFixed(2)}%</li>
                    )}
                  </>
                )}
              </ul>
              <div className="mt-2 p-2 bg-gray-700 rounded">
                <h3 className="text-md font-semibold">Recommendations</h3>
                <p>{eyeContactResult.recommendations || "No recommendations available"}</p>
              </div>
            </div>
          )}

          {emotionResult.emotion_analysis && (
            <div className="mt-6 w-[90%] max-w-md md:max-w-[800px] mx-auto p-4 bg-gray-800 rounded-lg text-white">
              <h2 className="text-lg font-bold">Emotion Recognition</h2>
              <ul className="list-disc pl-5 mt-2">
                {emotionResult.emotion_analysis.neutral > 0 && (
                  <li>Neutral: {(emotionResult.emotion_analysis.neutral).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.sad > 0 && (
                  <li>Sad: {(emotionResult.emotion_analysis.sad).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.angry > 0 && (
                  <li>Angry: {(emotionResult.emotion_analysis.angry).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.disgust > 0 && (
                  <li>Disgust: {(emotionResult.emotion_analysis.disgust).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.happy > 0 && (
                  <li>Happy: {(emotionResult.emotion_analysis.happy).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.fear > 0 && (
                  <li>Fear: {(emotionResult.emotion_analysis.fear).toFixed(2)}%</li>
                )}
                {emotionResult.emotion_analysis.surprise > 0 && (
                  <li>Surprise: {(emotionResult.emotion_analysis.surprise).toFixed(2)}%</li>
                )}
              </ul>
              <div className="mt-2 p-2 bg-gray-700 rounded">
                <h3 className="text-md font-semibold">Recommendations</h3>
                <p>{emotionResult.recommendations || "No recommendations available"}</p>
              </div>
            </div>
          )}

          {audioResult.stutter_detection && (
            <div className="mt-6 w-[90%] max-w-md md:max-w-[800px] mx-auto p-4 bg-gray-800 rounded-lg text-white">
              <h2 className="text-lg font-bold">Stutter Detection Report</h2>
              <ul className="list-disc pl-5 mt-2">
                <li>Nonstutter: {(audioResult.stutter_detection.nonstutter || 0).toFixed(2)}%</li>
                <li>Repetition: {(audioResult.stutter_detection.repetition || 0).toFixed(2)}%</li>
                <li>Prolongation: {(audioResult.stutter_detection.prolongation || 0).toFixed(2)}%</li>
                <li>Blocks: {(audioResult.stutter_detection.blocks || 0).toFixed(2)}%</li>
              </ul>
              <div className="mt-2 p-2 bg-gray-700 rounded">
                <h3 className="text-md font-semibold">Recommendations</h3>
                <p>{audioResult.recommendations || "No recommendations available"}</p>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">Transcribed Text</h2>
                <p>{audioResult.transcribed_text || "No transcription available"}</p>
                <h2 className="text-lg font-bold mt-4">Main Topics</h2>
                <p>{audioResult.summary || "No summary available"}</p>
              </div>
            </div>
          )}

          {areAllAnalysesComplete() && (eyeContactResult.eye_contact_analysis || emotionResult.emotion_analysis || audioResult.stutter_detection) && (
            <div className="mt-8 mb-8 flex justify-center w-full">
              <button
                onClick={downloadCombinedReportAsPDF}
                className="bg-blue-500 text-white py-2 px-6 rounded-xl hover:bg-blue-600"
                disabled={!jsPDF || !logoBase64}
              >
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}