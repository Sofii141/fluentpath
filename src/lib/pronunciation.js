/**
 * Professional pronunciation assessment via Azure Speech.
 *
 * Config (key + region) lives in localStorage under "englishup.azure".
 * When not configured, `azureConfigured()` returns false and the Speaking
 * module falls back to the free browser-recognition proxy.
 *
 * Azure returns calibrated scores (0-100):
 *   - accuracy:     how close sounds are to a native speaker
 *   - fluency:      smoothness / pacing
 *   - completeness: how much of the reference text was spoken
 *   - pronunciation: overall combined score
 * Plus per-word and per-phoneme accuracy, so we can highlight exact sounds.
 */

const KEY = "englishup.azure";

/** Optional default from the .env (VITE_ vars are injected at build time). */
function envConfig() {
  const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION;
  return key && region ? { key, region } : null;
}

export function getAzureConfig() {
  try {
    const raw = localStorage.getItem(KEY);
    const cfg = raw ? JSON.parse(raw) : null;
    if (cfg?.key && cfg?.region) return cfg;
  } catch {
    /* ignore and fall through to env */
  }
  return envConfig();
}

export function saveAzureConfig(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function clearAzureConfig() {
  localStorage.removeItem(KEY);
}

export const azureConfigured = () => !!getAzureConfig();

/**
 * Record from the microphone and assess pronunciation against `referenceText`.
 * Resolves with { pronunciation, accuracy, fluency, completeness, words, recognized }.
 * Each word: { word, accuracy, errorType, phonemes:[{ phoneme, accuracy }] }.
 */
async function runAssessment(referenceText, enableMiscue) {
  const cfg = getAzureConfig();
  if (!cfg) throw new Error("Azure not configured");

  // Lazy-load the SDK so it doesn't bloat the initial bundle.
  const SDK = await import("microsoft-cognitiveservices-speech-sdk");

  const speechConfig = SDK.SpeechConfig.fromSubscription(cfg.key, cfg.region);
  speechConfig.speechRecognitionLanguage = "en-US";

  const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);

  const paConfig = new SDK.PronunciationAssessmentConfig(
    referenceText,
    SDK.PronunciationAssessmentGradingSystem.HundredMark,
    SDK.PronunciationAssessmentGranularity.Phoneme,
    enableMiscue
  );
  // Prosody scoring (intonation/rhythm) when supported — great for fluency.
  try { paConfig.enableProsodyAssessment = true; } catch { /* older SDK */ }
  paConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        try {
          if (result.reason !== SDK.ResultReason.RecognizedSpeech) {
            recognizer.close();
            return reject(new Error("No speech recognized. Try again, closer to the mic."));
          }
          const pa = SDK.PronunciationAssessmentResult.fromResult(result);
          const detail = pa.detailResult || {};
          const words = (detail.Words || []).map((w) => ({
            word: w.Word,
            accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
            errorType: w.PronunciationAssessment?.ErrorType || "None",
            phonemes: (w.Phonemes || []).map((p) => ({
              phoneme: p.Phoneme,
              accuracy: Math.round(p.PronunciationAssessment?.AccuracyScore ?? 0),
            })),
          }));
          recognizer.close();
          resolve({
            pronunciation: Math.round(pa.pronunciationScore),
            accuracy: Math.round(pa.accuracyScore),
            fluency: Math.round(pa.fluencyScore),
            completeness: Math.round(pa.completenessScore),
            recognized: result.text,
            words,
          });
        } catch (e) {
          recognizer.close();
          reject(e);
        }
      },
      (err) => {
        recognizer.close();
        reject(new Error(typeof err === "string" ? err : "Assessment failed"));
      }
    );
  });
}

/** Scripted assessment: compare speech against a known target sentence. */
export const assessPronunciation = (referenceText) => runAssessment(referenceText, true);

/**
 * Reference-text-free assessment for free conversation: the learner can say
 * anything, and we still score how well they pronounced it (no target needed).
 */
export const assessSpeech = () => runAssessment("", false);
