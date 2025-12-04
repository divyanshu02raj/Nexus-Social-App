import * as React from 'react';
import { SkinTones } from '../../../types/exposedTypes';
declare type Props = {
    isOpen: boolean;
    onClick: () => void;
    isActive: boolean;
    skinToneVariation: SkinTones;
    style?: React.CSSProperties;
};
export declare function BtnSkinToneVariation({ isOpen, onClick, isActive, skinToneVariation, style }: Props): JSX.Element;
export {};
