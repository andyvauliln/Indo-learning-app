/**
 * Custom hooks for reading text feature
 */

export { useParagraphState } from "./use-paragraph-state"
export { useContentFormatting } from "./use-content-formatting"
export { useVoiceRecording, useTTS, usePronunciationCheck } from "./use-speech"
export type {
    UseVoiceRecordingOptions,
    UseVoiceRecordingReturn,
    UseTTSOptions,
    UseTTSReturn,
    UsePronunciationCheckOptions,
    UsePronunciationCheckReturn,
} from "./use-speech"
