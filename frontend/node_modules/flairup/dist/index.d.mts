type StyleObject = Partial<CSSStyleDeclaration>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
type CSSVariablesObject = Record<`--${string}`, string>;
type ConditionPrefix = '.' | ':' | '~' | '+' | '*' | '>' | '&.' | '&:';
type ConditionKey = `${ConditionPrefix}${string}`;
type ClassSet = Set<string>;
type Styles = Partial<StyleObject & Chunks & PostConditionStyles>;
type PostConditionStyles = {
    [k: ConditionKey]: StyleObject | FlairUpProperties | Chunks | PostConditionStyles;
};
type ScopedStyles<K extends string = string> = Record<S<K>, ClassSet>;
type DirectClass = string | string[];
type FlairUpProperties = Partial<{
    '.'?: DirectClass;
    '--'?: CSSVariablesObject;
}>;
type Chunks = {
    [k: MediaQuery]: StyleObject | Record<'--', CSSVariablesObject> | PostConditionStyles;
} & {
    [k: Pseudo]: StyleObject;
};
type CreateSheetInput<K extends string> = Partial<{
    [k in K]: Styles | FlairUpProperties;
} | PreConditions<K>>;
type PreConditions<K extends string> = {
    [k: ConditionKey]: {
        [k in K]: Styles;
    } | PreConditions<K>;
};
type S<K extends string> = Exclude<K, ConditionKey | '--' | '.' | keyof CSSStyleDeclaration | Pseudo | MediaQuery>;
type createSheetReturn = {
    create: <K extends string>(styles: CreateSheetInput<K>) => ScopedStyles<S<K>> & ScopedStyles<string>;
    getStyle: () => string;
    isApplied: () => boolean;
};

declare function cx(...args: unknown[]): string;

declare function createSheet(name: string, rootNode?: HTMLElement | null): createSheetReturn;

export { type CreateSheetInput, type Styles, createSheet, cx };
