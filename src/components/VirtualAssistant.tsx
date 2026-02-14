import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Mic, MicOff, MessageCircle, Headphones,
  Loader2, Volume2, VolumeX
} from 'lucide-react';
import type { AssistantConfig } from '@/config/assistants';
import { supabase } from '@/integrations/supabase/client';

type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking';
type InputMode = 'text' | 'voice';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VirtualAssistantProps {
  assistant: AssistantConfig;
  onClose: () => void;
  initialMode?: InputMode;
}

export const VirtualAssistant = ({ assistant, onClose, initialMode = 'text' }: VirtualAssistantProps) => {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>(initialMode);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !supabase) return;
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStatus('thinking');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data, error: fnError } = await supabase.functions.invoke('assistant-chat', {
        body: { message: text.trim(), history, systemPrompt: assistant.systemPrompt },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const reply = data?.reply || "I'm sorry, I couldn't respond.";
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak the response
      if (!isMuted) {
        await speakText(reply);
      } else {
        setStatus('idle');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Something went wrong. Please try again.');
      setStatus('idle');
    }
  }, [messages, assistant.systemPrompt, isMuted]);

  const speakText = useCallback(async (text: string) => {
    setStatus('speaking');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-speak`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId: assistant.voiceId }),
        }
      );

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setStatus('idle');
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setStatus('idle');
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('Speak error:', err);
      setStatus('idle');
    }
  }, [assistant.voiceId]);

  const startRecording = useCallback(async () => {
    setError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Setup waveform visualisation
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      drawWaveform();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        stopRecording();
      };

      recognition.onend = () => {
        // Will be handled by stopRecording
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatus('listening');
    } catch (err) {
      console.error('Mic error:', err);
      setError('Could not access microphone.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);

    if (liveTranscript.trim()) {
      sendMessage(liveTranscript.trim());
    }
    setLiveTranscript('');
    if (status === 'listening') setStatus('idle');
  }, [liveTranscript, sendMessage, status]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = assistant.accentColor;
        ctx.globalAlpha = 0.6 + (dataArray[i] / 255) * 0.4;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      ctx.globalAlpha = 1;
    };
    draw();
  }, [assistant.accentColor]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const statusDotColor = status === 'idle' ? '#4ADE80'
    : status === 'thinking' ? '#FBBF24'
    : status === 'speaking' ? assistant.accentColor
    : '#60A5FA';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
        style={{ background: '#0F0E17' }}
      >
        {/* Left Panel - Avatar (hidden on mobile) */}
        <div className="hidden md:flex w-[40%] relative overflow-hidden">
          <motion.img
            src={assistant.avatarImageUrl}
            alt={assistant.name}
            className="w-full h-full object-cover"
            style={{ borderRadius: '0 2rem 2rem 0' }}
            animate={
              status === 'speaking'
                ? { scale: [1, 1.02, 1] }
                : status === 'idle'
                ? { scale: [1, 1.01, 1] }
                : {}
            }
            transition={
              status === 'speaking'
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : status === 'idle'
                ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
          />

          {/* Speaking pulse ring */}
          {status === 'speaking' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: '0 2rem 2rem 0',
                boxShadow: `inset 0 0 60px ${assistant.accentColor}40`,
              }}
              animate={{
                boxShadow: [
                  `inset 0 0 30px ${assistant.accentColor}20`,
                  `inset 0 0 80px ${assistant.accentColor}50`,
                  `inset 0 0 30px ${assistant.accentColor}20`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Listening ring */}
          {status === 'listening' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: '0 2rem 2rem 0' }}
              animate={{
                boxShadow: [
                  'inset 0 0 30px rgba(96,165,250,0.2)',
                  'inset 0 0 80px rgba(96,165,250,0.5)',
                  'inset 0 0 30px rgba(96,165,250,0.2)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Gradient overlay at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{
              background: `linear-gradient(transparent, ${assistant.accentColor}30, #0F0E17)`,
              borderRadius: '0 0 2rem 0',
            }}
          >
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {assistant.name}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {assistant.specialtyTags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full font-medium text-white/90"
                  style={{ background: `${assistant.accentColor}40` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              {/* Mobile avatar thumbnail */}
              <div className="md:hidden w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2"
                style={{ borderColor: assistant.accentColor }}>
                <img src={assistant.avatarImageUrl} alt={assistant.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {assistant.name}
                  </h3>
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: statusDotColor }}
                    animate={
                      status === 'thinking'
                        ? { opacity: [1, 0.4, 1] }
                        : status === 'speaking'
                        ? { scale: [1, 1.3, 1] }
                        : {}
                    }
                    transition={{ duration: status === 'thinking' ? 1.5 : 0.8, repeat: Infinity }}
                  />
                </div>
                <div className="hidden md:flex gap-1.5 mt-1">
                  {assistant.specialtyTags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full text-white/70"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl text-white/50 hover:text-white/80 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/50 hover:text-white/80 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className="w-16 h-16 rounded-full mb-4 overflow-hidden border-2"
                  style={{ borderColor: assistant.accentColor }}
                >
                  <img src={assistant.avatarImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-white/60 text-sm max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {assistant.bio}
                </p>
                <p className="text-white/30 text-xs mt-2">
                  Start a conversation below
                </p>
              </div>
            )}

            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1">
                    <img src={assistant.avatarImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    ...(msg.role === 'user'
                      ? { background: 'rgba(255,255,255,0.1)', color: '#F5F0FF' }
                      : { background: `${assistant.accentColor}20`, color: '#F5F0FF', borderLeft: `3px solid ${assistant.accentColor}` }),
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {status === 'thinking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <img src={assistant.avatarImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: `${assistant.accentColor}20` }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: assistant.accentColor }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {error && (
              <div className="text-center text-red-400 text-xs py-2">{error}</div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="px-5 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {/* Mode tabs */}
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  inputMode === 'text' ? 'text-white' : 'text-white/40'
                }`}
                style={inputMode === 'text' ? { background: 'rgba(255,255,255,0.1)' } : {}}
              >
                <MessageCircle size={14} /> Text
              </button>
              <button
                onClick={() => setInputMode('voice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  inputMode === 'voice' ? 'text-white' : 'text-white/40'
                }`}
                style={inputMode === 'voice' ? { background: 'rgba(255,255,255,0.1)' } : {}}
              >
                <Headphones size={14} /> Voice
              </button>
            </div>

            {inputMode === 'text' ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    disabled={status === 'thinking' || status === 'speaking'}
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <span className="absolute bottom-1 right-3 text-[10px] text-white/20">
                    {inputText.length}
                  </span>
                </div>
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || status === 'thinking' || status === 'speaking'}
                  className="px-4 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-30"
                  style={{ background: assistant.accentColor }}
                >
                  <Send size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {/* Waveform */}
                {isRecording && (
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={60}
                    className="rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                )}

                {/* Live transcript */}
                {liveTranscript && (
                  <p className="text-white/60 text-sm text-center italic max-w-xs">
                    "{liveTranscript}"
                  </p>
                )}

                {/* Mic button */}
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={status === 'thinking' || status === 'speaking'}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-30"
                  style={{
                    background: isRecording ? '#EF4444' : assistant.accentColor,
                    boxShadow: isRecording
                      ? '0 0 30px rgba(239,68,68,0.4)'
                      : `0 0 30px ${assistant.accentColor}40`,
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                  transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
                >
                  {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                </motion.button>

                <p className="text-white/30 text-xs">
                  {isRecording ? 'Tap to stop' : 'Tap to speak'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
