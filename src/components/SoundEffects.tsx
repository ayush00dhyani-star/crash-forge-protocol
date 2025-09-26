import { useEffect, useRef } from "react";

interface SoundEffectsProps {
  playBetSound?: boolean;
  playCashoutSound?: boolean;
  playCrashSound?: boolean;
  playTickSound?: boolean;
}

export const SoundEffects = ({ 
  playBetSound, 
  playCashoutSound, 
  playCrashSound, 
  playTickSound 
}: SoundEffectsProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  useEffect(() => {
    if (playBetSound) {
      // Bet placed sound - ascending notes
      playSound(440, 0.1, 'square');
      setTimeout(() => playSound(660, 0.1, 'square'), 50);
    }
  }, [playBetSound]);

  useEffect(() => {
    if (playCashoutSound) {
      // Cashout sound - success chime
      playSound(523, 0.15, 'sine', 0.15);
      setTimeout(() => playSound(659, 0.15, 'sine', 0.15), 75);
      setTimeout(() => playSound(784, 0.2, 'sine', 0.15), 150);
    }
  }, [playCashoutSound]);

  useEffect(() => {
    if (playCrashSound) {
      // Crash sound - dramatic drop
      playSound(200, 0.5, 'sawtooth', 0.2);
      setTimeout(() => playSound(100, 0.3, 'square', 0.15), 100);
    }
  }, [playCrashSound]);

  useEffect(() => {
    if (playTickSound) {
      // Subtle tick for multiplier updates
      playSound(800, 0.03, 'square', 0.05);
    }
  }, [playTickSound]);

  return null; // This component doesn't render anything
};