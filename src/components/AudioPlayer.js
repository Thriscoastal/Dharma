//import React, { useState, useEffect, useRef } from 'react';
//import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons';
//import Sound from 'react-native-sound';
//import { COLORS, RADIUS } from '../constants/colors';
//
//import { useTheme } from '../context/ThemeContext';
//
//// Enable playback in silence mode
//Sound.setCategory('Playback');
//
//const AudioPlayer = ({ audioUrl, duration: audioDuration, chapterNumber, verseNumber, autoPlay = false }) => {
//  const { isDark } = useTheme();
//  const [isLoading, setIsLoading] = useState(false);
//  const [isPlaying, setIsPlaying] = useState(false);
//  const [hasError, setHasError] = useState(false);
//  const [currentTime, setCurrentTime] = useState(0);
//  const [duration, setDuration] = useState(audioDuration || 0);
//
//  const soundRef = useRef(null);
//  const progressIntervalRef = useRef(null);
//  const isMountedRef = useRef(true);
//  const hasAutoPlayedRef = useRef(false);
//
//  const styles = getStyles(isDark);
//
//  useEffect(() => {
//    isMountedRef.current = true;
//
//    return () => {
//      isMountedRef.current = false;
//      if (progressIntervalRef.current) {
//        clearInterval(progressIntervalRef.current);
//      }
//      if (soundRef.current) {
//        soundRef.current.release();
//        soundRef.current = null;
//      }
//    };
//  }, []);
//
//  useEffect(() => {
//    return () => {
//      if (soundRef.current) {
//        soundRef.current.stop(() => {
//          soundRef.current.release();
//          soundRef.current = null;
//        });
//      }
//      if (progressIntervalRef.current) {
//        clearInterval(progressIntervalRef.current);
//      }
//    };
//  }, [audioUrl]);
//
//  // Auto-play effect
//  useEffect(() => {
//    if (autoPlay && !hasAutoPlayedRef.current && audioUrl) {
//      hasAutoPlayedRef.current = true;
//      // Small delay to ensure component is mounted
//      setTimeout(() => {
//        if (isMountedRef.current) {
//          loadAndPlayAudio();
//        }
//      }, 300);
//    }
//  }, [autoPlay, audioUrl]);
//
//  const startProgressTracking = () => {
//    if (progressIntervalRef.current) {
//      clearInterval(progressIntervalRef.current);
//    }
//
//    // Poll less frequently to reduce JS thread pressure
//    progressIntervalRef.current = setInterval(() => {
//      if (soundRef.current && isMountedRef.current) {
//        soundRef.current.getCurrentTime((seconds) => {
//          if (isMountedRef.current) {
//            setCurrentTime(seconds);
//          }
//        });
//      }
//    }, 500);
//  };
//
//  const stopProgressTracking = () => {
//    if (progressIntervalRef.current) {
//      clearInterval(progressIntervalRef.current);
//      progressIntervalRef.current = null;
//    }
//  };
//
//  const loadAndPlayAudio = () => {
//    if (!audioUrl) {
//      Alert.alert('Audio Not Available', 'No audio file found for this verse.');
//      return;
//    }
//
//    setIsLoading(true);
//    setHasError(false);
//
//    if (soundRef.current) {
//      soundRef.current.release();
//      soundRef.current = null;
//    }
//
//    const sound = new Sound(audioUrl, null, (error) => {
//      if (!isMountedRef.current) return;
//
//      if (error) {
//        console.error('Failed to load audio:', error);
//        setIsLoading(false);
//        setHasError(true);
//        Alert.alert('Error', 'Failed to load audio. Please check your internet connection.');
//        return;
//      }
//
//      soundRef.current = sound;
//      const audioDur = sound.getDuration();
//      setDuration(audioDur);
//      setIsLoading(false);
//
//      sound.play((success) => {
//        if (!isMountedRef.current) return;
//
//        if (success) {
//          setIsPlaying(false);
//          setCurrentTime(0);
//          stopProgressTracking();
//        } else {
//          console.error('Playback failed');
//          setIsPlaying(false);
//          stopProgressTracking();
//        }
//      });
//
//      setIsPlaying(true);
//      startProgressTracking();
//    });
//  };
//
//  const handlePlayPause = () => {
//    if (isLoading) return;
//
//    if (!soundRef.current) {
//      loadAndPlayAudio();
//      return;
//    }
//
//    if (isPlaying) {
//      soundRef.current.pause();
//      setIsPlaying(false);
//      stopProgressTracking();
//    } else {
//      soundRef.current.play((success) => {
//        if (!isMountedRef.current) return;
//
//        if (success) {
//          setIsPlaying(false);
//          setCurrentTime(0);
//          stopProgressTracking();
//        } else {
//          console.error('Playback failed');
//          setIsPlaying(false);
//          stopProgressTracking();
//        }
//      });
//      setIsPlaying(true);
//      startProgressTracking();
//    }
//  };
//
//  const handleRetry = () => {
//    setHasError(false);
//    loadAndPlayAudio();
//  };
//
//  const formatTime = (seconds) => {
//    if (!seconds || isNaN(seconds)) return '0:00';
//    const mins = Math.floor(seconds / 60);
//    const secs = Math.floor(seconds % 60);
//    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//  };
//
//  if (!audioUrl) {
//    return null;
//  }
//
//  if (hasError) {
//    return (
//      <View style={styles.container}>
//        <Icon name="error-outline" size={24} color={COLORS.primary} />
//        <Text style={styles.errorText}>Unable to load audio</Text>
//        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
//          <Text style={styles.retryButtonText}>Retry</Text>
//        </TouchableOpacity>
//      </View>
//    );
//  }
//
//  return (
//    <View style={styles.container}>
//      <View style={styles.controls}>
//        <TouchableOpacity
//          onPress={handlePlayPause}
//          style={styles.playButton}
//          disabled={isLoading}
//          activeOpacity={0.7}>
//          {isLoading ? (
//            <ActivityIndicator size="small" color="#FFFFFF" />
//          ) : (
//            <Icon
//              name={isPlaying ? 'pause' : 'play-arrow'}
//              size={24}
//              color="#FFFFFF"
//            />
//          )}
//        </TouchableOpacity>
//
//        <View style={styles.audioInfo}>
//          <Text style={styles.audioLabel}>
//            Chapter {chapterNumber} · Verse {verseNumber}
//          </Text>
//          {duration > 0 && (
//            <Text style={styles.durationText}>
//              {formatTime(currentTime)} / {formatTime(duration)}
//            </Text>
//          )}
//        </View>
//      </View>
//
//      {duration > 0 && (
//        <View style={styles.progressContainer}>
//          <View style={styles.progressBar}>
//            <View
//              style={[
//                styles.progressFill,
//                { width: `${Math.min((currentTime / duration) * 100, 100)}%` }
//              ]}
//            />
//          </View>
//        </View>
//      )}
//    </View>
//  );
//};
//
//const getStyles = (isDark) =>
//  StyleSheet.create({
//    container: {
//      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
//      borderRadius: RADIUS.button,
//      padding: 16,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//    },
//    controls: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      gap: 12,
//    },
//    playButton: {
//      width: 48,
//      height: 48,
//      borderRadius: 24,
//      backgroundColor: COLORS.primary,
//      justifyContent: 'center',
//      alignItems: 'center',
//    },
//    audioInfo: {
//      flex: 1,
//    },
//    audioLabel: {
//      fontSize: 15,
//      fontWeight: '600',
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      marginBottom: 2,
//    },
//    durationText: {
//      fontSize: 13,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//    },
//    progressContainer: {
//      marginTop: 12,
//    },
//    progressBar: {
//      height: 3,
//      backgroundColor: isDark ? COLORS.darkBorder : COLORS.border,
//      borderRadius: 2,
//      overflow: 'hidden',
//    },
//    progressFill: {
//      height: '100%',
//      backgroundColor: COLORS.primary,
//    },
//    errorText: {
//      textAlign: 'center',
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      fontSize: 14,
//      marginTop: 8,
//      marginBottom: 12,
//    },
//    retryButton: {
//      backgroundColor: COLORS.primary,
//      paddingHorizontal: 20,
//      paddingVertical: 8,
//      borderRadius: RADIUS.chip,
//      alignSelf: 'center',
//    },
//    retryButtonText: {
//      color: '#FFFFFF',
//      fontSize: 14,
//      fontWeight: '600',
//    },
//  });
//
//export default AudioPlayer;


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';
import { COLORS, RADIUS } from '../constants/colors';

import { useTheme } from '../context/ThemeContext';

// Enable playback in silence mode
Sound.setCategory('Playback');

const SKIP_SECONDS = 5;

const AudioPlayer = ({ audioUrl, duration: audioDuration, chapterNumber, verseNumber, autoPlay = false }) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);

  const soundRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasAutoPlayedRef = useRef(false);

  const styles = getStyles(isDark);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop(() => {
          soundRef.current.release();
          soundRef.current = null;
        });
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [audioUrl]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && !hasAutoPlayedRef.current && audioUrl) {
      hasAutoPlayedRef.current = true;
      // Small delay to ensure component is mounted
      setTimeout(() => {
        if (isMountedRef.current) {
          loadAndPlayAudio();
        }
      }, 300);
    }
  }, [autoPlay, audioUrl]);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Poll less frequently to reduce JS thread pressure
    progressIntervalRef.current = setInterval(() => {
      if (soundRef.current && isMountedRef.current) {
        soundRef.current.getCurrentTime((seconds) => {
          if (isMountedRef.current) {
            setCurrentTime(seconds);
          }
        });
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const loadAndPlayAudio = () => {
    if (!audioUrl) {
      Alert.alert('Audio Not Available', 'No audio file found for this verse.');
      return;
    }

    setIsLoading(true);
    setHasError(false);

    if (soundRef.current) {
      soundRef.current.release();
      soundRef.current = null;
    }

    const sound = new Sound(audioUrl, null, (error) => {
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Failed to load audio:', error);
        setIsLoading(false);
        setHasError(true);
        Alert.alert('Error', 'Failed to load audio. Please check your internet connection.');
        return;
      }

      soundRef.current = sound;
      const audioDur = sound.getDuration();
      setDuration(audioDur);
      setIsLoading(false);

      sound.play((success) => {
        if (!isMountedRef.current) return;

        if (success) {
          setIsPlaying(false);
          setCurrentTime(0);
          stopProgressTracking();
        } else {
          console.error('Playback failed');
          setIsPlaying(false);
          stopProgressTracking();
        }
      });

      setIsPlaying(true);
      startProgressTracking();
    });
  };

  const handlePlayPause = () => {
    if (isLoading) return;

    if (!soundRef.current) {
      loadAndPlayAudio();
      return;
    }

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    } else {
      soundRef.current.play((success) => {
        if (!isMountedRef.current) return;

        if (success) {
          setIsPlaying(false);
          setCurrentTime(0);
          stopProgressTracking();
        } else {
          console.error('Playback failed');
          setIsPlaying(false);
          stopProgressTracking();
        }
      });
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  // ── Skip forward / backward ─────────────────────────────────────────
  const handleSkip = (deltaSeconds) => {
    if (isLoading || !soundRef.current) return;

    soundRef.current.getCurrentTime((seconds) => {
      if (!isMountedRef.current || !soundRef.current) return;

      const maxTime = duration > 0 ? duration : seconds + deltaSeconds;
      const newTime = Math.max(0, Math.min(seconds + deltaSeconds, maxTime));

      soundRef.current.setCurrentTime(newTime);
      setCurrentTime(newTime);
    });
  };

  const handleSkipBack = () => handleSkip(-SKIP_SECONDS);
  const handleSkipForward = () => handleSkip(SKIP_SECONDS);

  const handleRetry = () => {
    setHasError(false);
    loadAndPlayAudio();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!audioUrl) {
    return null;
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <Icon name="error-outline" size={24} color={COLORS.primary} />
        <Text style={styles.errorText}>Unable to load audio</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const skipDisabled = isLoading || !soundRef.current;

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleSkipBack}
          style={[styles.skipButton, skipDisabled && styles.skipButtonDisabled]}
          disabled={skipDisabled}
          activeOpacity={0.7}>
          <Icon
            name="replay-5"
            size={22}
            color={skipDisabled ? (isDark ? COLORS.darkBorder : COLORS.border) : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayPause}
          style={styles.playButton}
          disabled={isLoading}
          activeOpacity={0.7}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={24}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkipForward}
          style={[styles.skipButton, skipDisabled && styles.skipButtonDisabled]}
          disabled={skipDisabled}
          activeOpacity={0.7}>
          <Icon
            name="forward-5"
            size={22}
            color={skipDisabled ? (isDark ? COLORS.darkBorder : COLORS.border) : COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.audioInfo}>
          <Text style={styles.audioLabel}>
            Chapter {chapterNumber} · Verse {verseNumber}
          </Text>
          {duration > 0 && (
            <Text style={styles.durationText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          )}
        </View>
      </View>

      {duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((currentTime / duration) * 100, 100)}%` }
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
      borderRadius: RADIUS.button,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skipButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(212, 175, 55, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    skipButtonDisabled: {
      opacity: 0.4,
    },
    audioInfo: {
      flex: 1,
      marginLeft: 4,
    },
    audioLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: 2,
    },
    durationText: {
      fontSize: 13,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
    },
    progressContainer: {
      marginTop: 12,
    },
    progressBar: {
      height: 3,
      backgroundColor: isDark ? COLORS.darkBorder : COLORS.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: COLORS.primary,
    },
    errorText: {
      textAlign: 'center',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      fontSize: 14,
      marginTop: 8,
      marginBottom: 12,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: RADIUS.chip,
      alignSelf: 'center',
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default AudioPlayer;