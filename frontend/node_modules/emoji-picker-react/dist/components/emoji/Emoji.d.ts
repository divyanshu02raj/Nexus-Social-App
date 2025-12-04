/// <reference types="react" />
import { DataEmoji } from '../../dataUtils/DataTypes';
import { BaseEmojiProps } from './BaseEmojiProps';
declare type ClickableEmojiProps = Readonly<BaseEmojiProps & {
    hidden?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emoji: DataEmoji;
    className?: string;
    noBackground?: boolean;
}>;
export declare function ClickableEmoji({ emoji, unified, hidden, hiddenOnSearch, emojiStyle, showVariations, size, lazyLoad, getEmojiUrl, className, noBackground }: ClickableEmojiProps): JSX.Element;
export {};
