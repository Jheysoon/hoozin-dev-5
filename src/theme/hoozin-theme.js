/**
 * Contains reusable themeable style objects, useful for branding
 */
import * as variables from './variables';

/* Hoozin brand logo */
export const BRAND_LOGO = {
    ...variables.BASE_FONT,
    ...variables.FONT_LIGHT,
    ...variables.LOGO_TEXT,
    color: variables.COLOR_SCHEME.PRIMARY_TEXT,
}

/* Hoozin brand body text */
export const BRAND_BODY_TEXT = {
    ...variables.BASE_FONT,
    ...variables.FONT_REGULAR,
    ...variables.BODY_TEXT,
    color: variables.COLOR_SCHEME.PRIMARY_TEXT
}

/* Hoozin brand body text for ANDROID */
export const BRAND_BODY_TEXT_ANDROID = {
    ...variables.BASE_FONT,
    ...variables.FONT_REGULAR,
    ...variables.BODY_TEXT_ANDROID,
    color: variables.COLOR_SCHEME.PRIMARY_TEXT
}

/* Hoozin brand heading text */
export const BRAND_HEADING_TEXT = {
    ...variables.BASE_FONT,
    ...variables.FONT_REGULAR,
    ...variables.HEADING2_TEXT,
    color: variables.COLOR_SCHEME.HEADING_TEXT
}

/* Hoozin brand color scheme */
export const BRAND_COLOR = { ...variables.COLOR_SCHEME }