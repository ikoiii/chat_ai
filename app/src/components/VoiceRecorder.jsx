import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";

export default function VoiceRecorder({ onTranscript, onSendVoice, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();

    } catch (error) {
      console.error('Error starting recording:', error);
      setError("Microphone access denied or unavailable");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioURL("");
    setTranscript("");
    setError("");
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate transcription
      // In a real app, you'd send this to a speech-to-text API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate transcription result
      const mockTranscript = "This is a voice message transcription. In a real implementation, this would be the actual transcribed text from the audio.";
      setTranscript(mockTranscript);

    } catch (error) {
      console.error('Transcription error:', error);
      setError("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendVoice = () => {
    if (transcript.trim() && onSendVoice) {
      onSendVoice({
        text: transcript.trim(),
        audioURL: audioURL,
        duration: recordingTime
      });
      // Reset state
      setTranscript("");
      setAudioURL("");
      setRecordingTime(0);
    }
  };

  const handleRetranscribe = () => {
    if (audioURL) {
      fetch(audioURL)
        .then(response => response.blob())
        .then(blob => transcribeAudio(blob))
        .catch(error => {
          console.error('Error re-transcribing:', error);
          setError("Failed to re-transcribe audio");
        });
    }
  };

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
            title="Start voice recording"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(recordingTime)}
            </span>

            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all"
                title="Resume recording"
              >
                <Mic className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all"
                title="Pause recording"
              >
                <MicOff className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={stopRecording}
              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
              title="Stop recording"
            >
              <MicOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {audioURL && (
          <div className="flex items-center gap-2">
            <audio
              src={audioURL}
              controls
              className="h-8"
            />
            <button
              onClick={cancelRecording}
              className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-all"
              title="Discard recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Transcribing audio...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Transcript:</span>
            <button
              onClick={handleRetranscribe}
              disabled={isProcessing}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Retry'}
            </button>
          </div>
          <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {transcript}
            </p>
          </div>
          {onSendVoice && (
            <button
              onClick={handleSendVoice}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              Send Voice Message
            </button>
          )}
        </div>
      )}
    </div>
  );
}