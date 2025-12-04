import React from 'react';
import { MouseDownEvent, OnSkinToneChange } from './config';
export declare type MutableConfig = {
    onEmojiClick?: MouseDownEvent;
    onReactionClick?: MouseDownEvent;
    onSkinToneChange?: OnSkinToneChange;
};
export declare const MutableConfigContext: React.Context<React.MutableRefObject<MutableConfig>>;
export declare function useMutableConfig(): React.MutableRefObject<MutableConfig>;
export declare function useDefineMutableConfig(config: MutableConfig): React.MutableRefObject<MutableConfig>;
