import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  /** Reproduce un beep usando Web Audio API. No requiere assets externos. */
  playBeep() {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      // Fallback silencioso si el navegador no soporta AudioContext
    }
  }

  /** Reproduce 3 beeps cortos (alerta de finalización). */
  playAlarm() {
    this.playBeep();
    setTimeout(() => this.playBeep(), 200);
    setTimeout(() => this.playBeep(), 400);
  }
}
