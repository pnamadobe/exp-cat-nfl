/*
 * Embed Audio Block
 * Show audio content with waveform visualization
 */

const isAudioFile = (url) => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  return audioExtensions.some((ext) => url.toLowerCase().includes(ext));
};

const createAudioPlayer = (url, title) => {
  const container = document.createElement('div');
  container.className = 'embed-audio-player';

  // Create waveform visualization
  const waveform = document.createElement('div');
  waveform.className = 'embed-audio-waveform';
  container.appendChild(waveform);

  // Create audio element with CORS support
  const audio = document.createElement('audio');
  audio.src = url;
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  container.appendChild(audio);

  const originalTitle = title || 'PLAY AUDIO';

  // Create play button
  const playBtn = document.createElement('button');
  playBtn.className = 'embed-audio-play-btn';
  playBtn.type = 'button';
  playBtn.textContent = originalTitle;

  playBtn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        playBtn.textContent = 'PAUSE';
        playBtn.classList.add('playing');
      } else {
        audio.pause();
        playBtn.textContent = originalTitle;
        playBtn.classList.remove('playing');
      }
    } catch (error) {
      // If CORS fails, try without crossOrigin
      if (audio.crossOrigin) {
        audio.crossOrigin = null;
        audio.src = url;
        try {
          await audio.play();
          playBtn.textContent = 'PAUSE';
          playBtn.classList.add('playing');
        } catch (e) {
          console.error('Audio playback failed:', e);
        }
      }
    }
  });

  audio.addEventListener('ended', () => {
    playBtn.textContent = originalTitle;
    playBtn.classList.remove('playing');
  });

  audio.addEventListener('error', () => {
    // If audio fails to load with CORS, retry without
    if (audio.crossOrigin) {
      audio.crossOrigin = null;
      audio.src = url;
    }
  });

  container.appendChild(playBtn);

  return container;
};

export default function decorate(block) {
  const link = block.querySelector('a');
  const url = link?.href;
  const title = link?.textContent || 'PLAY AUDIO';

  if (url && isAudioFile(url)) {
    // Handle audio files
    block.textContent = '';
    const player = createAudioPlayer(url, title);
    block.appendChild(player);
  } else if (url) {
    // Fallback for non-audio URLs (embed as iframe)
    block.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Embedded content" loading="lazy">
      </iframe>
    </div>`;
  }
}
