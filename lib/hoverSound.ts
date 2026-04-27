let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/hover.wav`);
    audio.volume = 0.5;
  }
  return audio;
}

export function playHoverSound() {
  try {
    const a = getAudio();
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch {
    // unavailable — silently ignore
  }
}
