import { Styles } from 'flairup';
import * as React from 'react';
export declare const stylesheet: {
    create: <K extends string>(styles: Partial<{ [k in K]: Partial<Partial<CSSStyleDeclaration>> | Partial<{
        '.'?: string | string[] | undefined;
        '--'?: any;
    }>; }> | Partial<{}>) => Record<Exclude<Exclude<K, any>, any>, Set<string>> & Record<never, Set<string>>;
    getStyle: () => string;
    isApplied: () => boolean;
};
export declare const commonStyles: Record<never, Set<string>>;
export declare const PickerStyleTag: React.NamedExoticComponent<object>;
export declare const commonInteractionStyles: Record<never, Set<string>>;
export declare function darkMode(key: string, value: Styles): {
    '.epr-dark-theme': {
        [x: string]: Partial<Partial<CSSStyleDeclaration>>;
    };
    '.epr-auto-theme': {
        [x: string]: {
            '@media (prefers-color-scheme: dark)': Partial<Partial<CSSStyleDeclaration>>;
        };
    };
};
