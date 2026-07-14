//import AsyncStorage from '@react-native-async-storage/async-storage';
//import RNFS from 'react-native-fs';
//
//const OFFLINE_PREFIX = 'offline_sloka_';
//const OFFLINE_INDEX_KEY = 'offline_sloka_index';
//const AUDIO_DIR = `${RNFS.DocumentDirectoryPath}/offline_audio`;
//
//const buildKey = (chapterNumber, slokaNumber) =>
//  `${OFFLINE_PREFIX}${chapterNumber}_${slokaNumber}`;
//
//const ensureAudioDir = async () => {
//  const exists = await RNFS.exists(AUDIO_DIR);
//  if (!exists) await RNFS.mkdir(AUDIO_DIR);
//};
//
//const downloadAudioFile = async (remoteUrl, fileName, onProgress) => {
//  await ensureAudioDir();
//  const localPath = `${AUDIO_DIR}/${fileName}`;
//
//  const alreadyExists = await RNFS.exists(localPath);
//  if (alreadyExists) return `file://${localPath}`;
//
//  const { promise } = RNFS.downloadFile({
//    fromUrl: remoteUrl,
//    toFile: localPath,
//    progressDivider: 5,
//    progress: (res) => {
//      if (onProgress && res.contentLength > 0) {
//        onProgress(Math.round((res.bytesWritten / res.contentLength) * 100));
//      }
//    },
//  });
//
//  const result = await promise;
//  if (result.statusCode !== 200) {
//    throw new Error(`Download failed (status ${result.statusCode})`);
//  }
//  return `file://${localPath}`;
//};
//
//const deleteLocalFile = async (fileUri) => {
//  try {
//    const path = fileUri.replace('file://', '');
//    const exists = await RNFS.exists(path);
//    if (exists) await RNFS.unlink(path);
//  } catch (e) {
//    // ignore missing/locked file
//  }
//};
//
//// options: { recitationAudioUrl, meaningAudioUrl, onProgress(type, pct) }
//export const saveSlokaOffline = async (
//  sloka,
//  chapter,
//  chapterNumber,
//  slokaNumber,
//  { recitationAudioUrl, meaningAudioUrl, onProgress } = {}
//) => {
//  try {
//    let recitationAudioPath = null;
//    let meaningAudioPath = null;
//
//    if (recitationAudioUrl) {
//      recitationAudioPath = await downloadAudioFile(
//        recitationAudioUrl,
//        `${chapterNumber}_${slokaNumber}_recitation.mp3`,
//        (pct) => onProgress && onProgress('recitation', pct)
//      );
//    }
//
//    if (meaningAudioUrl) {
//      meaningAudioPath = await downloadAudioFile(
//        meaningAudioUrl,
//        `${chapterNumber}_${slokaNumber}_meaning.mp3`,
//        (pct) => onProgress && onProgress('meaning', pct)
//      );
//    }
//
//    const key = buildKey(chapterNumber, slokaNumber);
//    const payload = {
//      sloka,
//      chapter,
//      recitationAudioPath,
//      meaningAudioPath,
//      savedAt: Date.now(),
//    };
//    await AsyncStorage.setItem(key, JSON.stringify(payload));
//    await addToIndex(key);
//    return payload;
//  } catch (e) {
//    console.warn('saveSlokaOffline failed', e);
//    return null;
//  }
//};
//
//export const getOfflineSloka = async (chapterNumber, slokaNumber) => {
//  try {
//    const raw = await AsyncStorage.getItem(buildKey(chapterNumber, slokaNumber));
//    return raw ? JSON.parse(raw) : null;
//  } catch (e) {
//    return null;
//  }
//};
//
//export const isSlokaOffline = async (chapterNumber, slokaNumber) => {
//  const raw = await AsyncStorage.getItem(buildKey(chapterNumber, slokaNumber));
//  return !!raw;
//};
//
//export const removeSlokaOffline = async (chapterNumber, slokaNumber) => {
//  try {
//    const key = buildKey(chapterNumber, slokaNumber);
//    const raw = await AsyncStorage.getItem(key);
//    if (raw) {
//      const record = JSON.parse(raw);
//      if (record.recitationAudioPath) await deleteLocalFile(record.recitationAudioPath);
//      if (record.meaningAudioPath) await deleteLocalFile(record.meaningAudioPath);
//    }
//    await AsyncStorage.removeItem(key);
//    await removeFromIndex(key);
//    return true;
//  } catch (e) {
//    return false;
//  }
//};
//
//export const getAllOfflineSlokaKeys = async () => {
//  const raw = await AsyncStorage.getItem(OFFLINE_INDEX_KEY);
//  return raw ? JSON.parse(raw) : [];
//};
//
//const addToIndex = async (key) => {
//  const keys = await getAllOfflineSlokaKeys();
//  if (!keys.includes(key)) {
//    keys.push(key);
//    await AsyncStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(keys));
//  }
//};
//
//const removeFromIndex = async (key) => {
//  const keys = await getAllOfflineSlokaKeys();
//  await AsyncStorage.setItem(
//    OFFLINE_INDEX_KEY,
//    JSON.stringify(keys.filter((k) => k !== key))
//  );
//};
//
//export const getAllOfflineSlokas = async () => {
//  const keys = await getAllOfflineSlokaKeys();
//  if (!keys.length) return [];
//  const pairs = await AsyncStorage.multiGet(keys);
//  return pairs
//    .map(([, value]) => {
//      try {
//        return JSON.parse(value);
//      } catch {
//        return null;
//      }
//    })
//    .filter(Boolean);
//};

import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const OFFLINE_PREFIX = 'offline_sloka_';
const OFFLINE_INDEX_KEY = 'offline_sloka_index';
const AUDIO_DIR = `${RNFS.DocumentDirectoryPath}/offline_audio`;

const buildKey = (chapterNumber, slokaNumber) =>
  `${OFFLINE_PREFIX}${chapterNumber}_${slokaNumber}`;

const ensureAudioDir = async () => {
  const exists = await RNFS.exists(AUDIO_DIR);
  if (!exists) await RNFS.mkdir(AUDIO_DIR);
};

const isRemoteUrl = (url) => /^https?:\/\//i.test(url);

const downloadAudioFile = async (sourceUrl, fileName, onProgress) => {
  await ensureAudioDir();
  const localPath = `${AUDIO_DIR}/${fileName}`;

  const alreadyExists = await RNFS.exists(localPath);
  if (alreadyExists) return `file://${localPath}`;

  if (isRemoteUrl(sourceUrl)) {
    // Genuine network URL — download it over HTTP
    const { promise } = RNFS.downloadFile({
      fromUrl: sourceUrl,
      toFile: localPath,
      progressDivider: 5,
      progress: (res) => {
        if (onProgress && res.contentLength > 0) {
          onProgress(Math.round((res.bytesWritten / res.contentLength) * 100));
        }
      },
    });

    const result = await promise;
    if (result.statusCode !== 200) {
      throw new Error(`Download failed (status ${result.statusCode})`);
    }
    return `file://${localPath}`;
  }

  // Already a local file (e.g. TTS output cached on-device) — just copy it
  const sourcePath = sourceUrl.replace('file://', '');
  const sourceExists = await RNFS.exists(sourcePath);
  if (!sourceExists) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  await RNFS.copyFile(sourcePath, localPath);
  if (onProgress) onProgress(100);
  return `file://${localPath}`;
};

const deleteLocalFile = async (fileUri) => {
  try {
    const path = fileUri.replace('file://', '');
    const exists = await RNFS.exists(path);
    if (exists) await RNFS.unlink(path);
  } catch (e) {
    // ignore missing/locked file
  }
};

// options: { recitationAudioUrl, meaningAudioUrl, onProgress(type, pct) }
export const saveSlokaOffline = async (
  sloka,
  chapter,
  chapterNumber,
  slokaNumber,
  { recitationAudioUrl, meaningAudioUrl, onProgress } = {}
) => {
  try {
    let recitationAudioPath = null;
    let meaningAudioPath = null;

    if (recitationAudioUrl) {
      recitationAudioPath = await downloadAudioFile(
        recitationAudioUrl,
        `${chapterNumber}_${slokaNumber}_recitation.mp3`,
        (pct) => onProgress && onProgress('recitation', pct)
      );
    }

    if (meaningAudioUrl) {
      meaningAudioPath = await downloadAudioFile(
        meaningAudioUrl,
        `${chapterNumber}_${slokaNumber}_meaning.mp3`,
        (pct) => onProgress && onProgress('meaning', pct)
      );
    }

    const key = buildKey(chapterNumber, slokaNumber);
    const payload = {
      sloka,
      chapter,
      recitationAudioPath,
      meaningAudioPath,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
    await addToIndex(key);
    return payload;
  } catch (e) {
    console.warn('saveSlokaOffline failed', e);
    return null;
  }
};

export const getOfflineSloka = async (chapterNumber, slokaNumber) => {
  try {
    const raw = await AsyncStorage.getItem(buildKey(chapterNumber, slokaNumber));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const isSlokaOffline = async (chapterNumber, slokaNumber) => {
  const raw = await AsyncStorage.getItem(buildKey(chapterNumber, slokaNumber));
  return !!raw;
};

export const removeSlokaOffline = async (chapterNumber, slokaNumber) => {
  try {
    const key = buildKey(chapterNumber, slokaNumber);
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const record = JSON.parse(raw);
      if (record.recitationAudioPath) await deleteLocalFile(record.recitationAudioPath);
      if (record.meaningAudioPath) await deleteLocalFile(record.meaningAudioPath);
    }
    await AsyncStorage.removeItem(key);
    await removeFromIndex(key);
    return true;
  } catch (e) {
    return false;
  }
};

export const getAllOfflineSlokaKeys = async () => {
  const raw = await AsyncStorage.getItem(OFFLINE_INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
};

const addToIndex = async (key) => {
  const keys = await getAllOfflineSlokaKeys();
  if (!keys.includes(key)) {
    keys.push(key);
    await AsyncStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(keys));
  }
};

const removeFromIndex = async (key) => {
  const keys = await getAllOfflineSlokaKeys();
  await AsyncStorage.setItem(
    OFFLINE_INDEX_KEY,
    JSON.stringify(keys.filter((k) => k !== key))
  );
};

export const getAllOfflineSlokas = async () => {
  const keys = await getAllOfflineSlokaKeys();
  if (!keys.length) return [];
  const pairs = await AsyncStorage.multiGet(keys);
  return pairs
    .map(([, value]) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};