import * as React from 'react';
declare type ClickableEmojiButtonProps = Readonly<{
    hidden?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emojiNames: string[];
    children: React.ReactNode;
    hasVariations: boolean;
    unified?: string;
    noBackground?: boolean;
    className?: string;
}>;
export declare function ClickableEmojiButton({ emojiNames, unified, hidden, hiddenOnSearch, showVariations, hasVariations, children, className, noBackground }: ClickableEmojiButtonProps): JSX.Element;
export {};
