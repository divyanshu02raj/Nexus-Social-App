import * as React from 'react';
import { EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones, SuggestionMode, Theme } from '../types/exposedTypes';
import { CategoriesConfig } from './categoryConfig';
import { PreviewConfig } from './config';
import { CustomEmoji } from './customEmojiConfig';
export declare enum MOUSE_EVENT_SOURCE {
    REACTIONS = "reactions",
    PICKER = "picker"
}
export declare function useSearchPlaceHolderConfig(): string;
export declare function useDefaultSkinToneConfig(): SkinTones;
export declare function useAllowExpandReactions(): boolean;
export declare function useSkinTonesDisabledConfig(): boolean;
export declare function useEmojiStyleConfig(): EmojiStyle;
export declare function useAutoFocusSearchConfig(): boolean;
export declare function useCategoriesConfig(): CategoriesConfig;
export declare function useCustomEmojisConfig(): CustomEmoji[];
export declare function useOpenConfig(): boolean;
export declare function useOnEmojiClickConfig(mouseEventSource: MOUSE_EVENT_SOURCE): (emoji: EmojiClickData, event: MouseEvent) => void;
export declare function useOnSkinToneChangeConfig(): (skinTone: SkinTones) => void;
export declare function usePreviewConfig(): PreviewConfig;
export declare function useThemeConfig(): Theme;
export declare function useSuggestedEmojisModeConfig(): SuggestionMode;
export declare function useLazyLoadEmojisConfig(): boolean;
export declare function useClassNameConfig(): string;
export declare function useStyleConfig(): React.CSSProperties;
export declare function useReactionsOpenConfig(): boolean;
export declare function useEmojiVersionConfig(): string | null;
export declare function useSearchDisabledConfig(): boolean;
export declare function useSkinTonePickerLocationConfig(): SkinTonePickerLocation;
export declare function useUnicodeToHide(): Set<string>;
export declare function useReactionsConfig(): string[];
export declare function useGetEmojiUrlConfig(): (unified: string, style: EmojiStyle) => string;
export declare function useSearchResultsConfig(searchResultsCount: number): string;
