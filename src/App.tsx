import { useCallback, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { useChat } from './hooks/useChat';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';

function App() {
  const {
    messages,
    isLoading,
    language,
    setLanguage,
    sendMessage,
    clearMessages,
  } = useChat();

  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    interimTranscript,
    toggleListening,
    resetTranscript,
  } = useVoiceRecognition(language);

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
  } = useTextToSpeech(language);

  // Auto-speak preference with localStorage persistence
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('lbs-auto-speak');
    return saved !== null ? saved === 'true' : true;
  });

  // Save auto-speak preference
  useEffect(() => {
    localStorage.setItem('lbs-auto-speak', String(autoSpeak));
  }, [autoSpeak]);

  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  const handleSpeak = useCallback((text: string) => {
    if (autoSpeak) {
      speak(text);
    }
  }, [speak, autoSpeak]);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        autoSpeak={autoSpeak}
        onAutoSpeakToggle={toggleAutoSpeak}
      />

      <main>
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          language={language}
          onSendMessage={handleSendMessage}
          onClearMessages={clearMessages}
          // Voice props
          isListening={isListening}
          isVoiceSupported={isVoiceSupported}
          onToggleVoice={toggleListening}
          interimTranscript={interimTranscript}
          transcript={transcript}
          onResetTranscript={resetTranscript}
          // TTS props
          isSpeaking={isSpeaking}
          onSpeak={handleSpeak}
          onStopSpeaking={stopSpeaking}
        />
      </main>
    </div>
  );
}

export default App;

