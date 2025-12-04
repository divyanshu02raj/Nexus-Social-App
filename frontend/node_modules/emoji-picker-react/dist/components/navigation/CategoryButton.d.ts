/// <reference types="react" />
import { CategoryConfig } from '../../config/categoryConfig';
declare type Props = {
    isActiveCategory: boolean;
    category: string;
    allowNavigation: boolean;
    onClick: () => void;
    categoryConfig: CategoryConfig;
};
export declare function CategoryButton({ isActiveCategory, category, allowNavigation, categoryConfig, onClick }: Props): JSX.Element;
export {};
