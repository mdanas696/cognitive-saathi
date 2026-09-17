import { LanguageCode, VoiceState } from '../types';

interface VoiceServiceCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscript: (text: string) => void;
  onResponse: (response: string) => void;
  onError: (errorMsg: string) => void;
}

export class VoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static isSpeaking = false;

  // Language mapping for Web Speech API
  private static getLangCode(lang: LanguageCode): string {
    switch (lang) {
      case 'as': return 'as-IN';
      case 'hi': return 'hi-IN';
      case 'mni': return 'bn-IN'; // Fallback phonetic code where supported
      case 'en':
      default:
        return 'en-IN';
    }
  }

  static speak(
    text: string,
    lang: LanguageCode = 'en',
    onEnd?: () => void,
    rate: number = 0.88 // Calm, slower pace for elderly comfort
  ): void {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getLangCode(lang);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  static isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  static startListening(
    lang: LanguageCode,
    callbacks: VoiceServiceCallbacks
  ): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onStateChange('ERROR');
      callbacks.onError("Voice recognition is not supported in this browser. You can continue comfortably with the buttons.");
      setTimeout(() => callbacks.onStateChange('IDLE'), 4000);
      return;
    }

    try {
      this.stopSpeaking();
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.lang = this.getLangCode(lang);
      recognition.continuous = false;
      recognition.interimResults = false;

      callbacks.onStateChange('LISTENING');

      recognition.onstart = () => {
        callbacks.onStateChange('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        callbacks.onTranscript(transcript);
        callbacks.onStateChange('PROCESSING');

        // Process intent locally for elderly user commands
        setTimeout(() => {
          const response = this.generateResponse(transcript, lang);
          callbacks.onResponse(response);
          callbacks.onStateChange('RESPONDING');

          this.speak(response, lang, () => {
            callbacks.onStateChange('IDLE');
          });
        }, 900);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        callbacks.onStateChange('ERROR');
        callbacks.onError("We didn't hear clearly, but everything is fine. Tap again whenever you are ready.");
        setTimeout(() => callbacks.onStateChange('IDLE'), 3500);
      };

      recognition.onend = () => {
        // Will transition to idle via speech callbacks or timeout
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      callbacks.onStateChange('ERROR');
      callbacks.onError("Microphone was busy. Please try tapping again gently.");
      setTimeout(() => callbacks.onStateChange('IDLE'), 3000);
    }
  }

  static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  // Conversational response generator tailored to elderly user routine & reassurance
  private static generateResponse(input: string, lang: LanguageCode): string {
    const lower = input.toLowerCase();

    if (lang === 'as') {
      if (lower.includes('ঔষধ') || lower.includes('দৰব') || lower.includes('medicine')) {
        return 'আপোনাৰ ৰাতিপুৱাৰ ঔষধ লোৱা হৈছে। পৰৱৰ্তী ঔষধ নিশা আঠ বাজি ত্ৰিশ মিনিটত নিৰ্ধাৰিত হৈছে।';
      }
      if (lower.includes('কাম') || lower.includes('ৰুতিন') || lower.includes('routine')) {
        return 'আজি আপোনাৰ পুৱাৰ খোজ কঢ়া আৰু বিয়লি চাৰে চাৰি বজাত এটা সহজ স্মৃতিৰ খেল বাকী আছে।';
      }
      return 'নমস্কাৰ আইতা। মই আপোনাৰ সাথী। সকলো ঠিকেই আছে, আপোনাৰ পৰিয়াল ওচৰতে আছে।';
    }

    if (lang === 'hi') {
      if (lower.includes('दवाई') || lower.includes('medicine')) {
        return 'आपकी सुबह की दवाई ली जा चुकी है। अगली गोली रात को साढ़े आठ बजे निर्धारित है।';
      }
      if (lower.includes('दिनचर्या') || lower.includes('routine') || lower.includes('काम')) {
        return 'आज आपका टहलना और दोपहर में एक शांतिपूर्ण स्मृति अभ्यास बचा हुआ है।';
      }
      return 'नमस्ते। मैं आपका साथी हूँ। सब कुछ कुशल मंगल है और परिवार आपके साथ है।';
    }

    if (lang === 'mni') {
      if (lower.includes('হিদাক') || lower.includes('medicine')) {
        return 'অদোমগী অয়ুক্কী হিদাক চারে। নুমিদাংগী হিদাক মতম চাবদা নীংশিংহল্লগনি।';
      }
      return 'খুরুমজরি। ঐহাক অদোমগী সাথীনি। পুম্নমক শান্তিগী মফমদা লৈরি।';
    }

    // Default English
    if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('pill')) {
      return 'Your morning medicine has been taken. Your next evening medicine is scheduled peacefully at 8:30 PM.';
    }
    if (lower.includes('routine') || lower.includes('schedule') || lower.includes('today') || lower.includes('plan')) {
      return 'Today your morning routine is well on track. You have a gentle 15-minute garden walk and a peaceful memory game ready.';
    }
    if (lower.includes('game') || lower.includes('activity') || lower.includes('play')) {
      return 'The Heritage Keepsakes memory activity is ready for you. You can tap Start Activity whenever you feel comfortable.';
    }
    if (lower.includes('who are you') || lower.includes('help')) {
      return 'I am CognitiveSaathi, your gentle companion. I am here to help you remember your daily routine and keep your mind active and calm.';
    }

    return 'Everything is peaceful and well. Your routine is right on time, and your support network is near.';
  }
}
