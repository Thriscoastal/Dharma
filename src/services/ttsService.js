import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

// Enable playback in silence mode
Sound.setCategory('Playback');

const LANGUAGE_VOICE_MAP = {
  'en': 'english_guru',
  'te': 'telugu_guru',
  'hi': 'hindi_guru',
  'ta': 'tamil_guru',
  'ml': 'malayalam_guru',
  'kn': 'kannada_guru'
};

const TTS_API_URL = 'https://paltry-unopposed-saint.ngrok-free.dev/generate-speech';

let currentSound = null;

/**
 * Stops and releases the current sound if it exists.
 */
export const stopMeaningAudio = () => {
  if (currentSound) {
    currentSound.stop();
    currentSound.release();
    currentSound = null;
  }
};

/**
 * Generates audio for the given text and language and returns the local file path.
 * @param {string} text The text to convert to speech.
 * @param {string} languageCode The app language code (en, te, hi, etc.)
 * @returns {Promise<string>} The path to the generated audio file.
 */
export const generateMeaningAudio = async (text, languageCode) => {
  const voice = LANGUAGE_VOICE_MAP[languageCode] || 'english_guru';

  try {
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        language: voice
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API Error response:', errorText);
      throw new Error(`TTS API failed with status ${response.status}`);
    }

    // Get the response as a blob
    const blob = await response.blob();
    
    // Create a unique filename based on timestamp to avoid cache issues
    const filename = `meaning_tts_${languageCode}_${Date.now()}.mp3`;
    const path = `${RNFS.CachesDirectoryPath}/${filename}`;
    
    // Convert blob to base64 for writing to file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          await RNFS.writeFile(path, base64data, 'base64');
          console.log('Audio file saved successfully to:', path);
          resolve(`file://${path}`);
        } catch (err) {
          console.error('Failed to write audio file:', err);
          reject(new Error('Failed to save audio file'));
        }
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
        reject(new Error('Failed to read audio data'));
      };
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error('Error in generateMeaningAudio:', error);
    throw error;
  }
};
