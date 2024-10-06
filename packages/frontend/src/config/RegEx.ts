/**
 * VINwiki Username Tag
 *
 * Matches:
 * - `@username` or `(space)@username`
 */
export const MentionRegex = /(?:^|\s)@([\w]+)/g;

/**
 * Email Address Link
 *
 * Matches:
 * - Most email addresses
 */
export const EmailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;

/**
 * Hyperlink
 *
 * Matches:
 * - Only links prefixed with `https://`
 */
export const HyperlinkRegex = /(https:\/\/[^\s]+)/g;
export const HyperlinkRegexNG = /(https:\/\/[^\s]+)/;

/**
 * Vehicle Identification Number
 *
 * Matches
 * - `#VIN` only
 * - Must be uppercase
 */
export const VinRegex = /(#[A-HJ-NPR-Z0-9]{17})/g;

/**
 * Vehicle Identification Number Character Regex
 *
 * Used to validate VIN integrity
 */
export const VinCharacterRegex = /^[A-HJ-NPR-Z0-9]+$/;

/**
 * OBDii Trouble Code
 *
 * Matches:
 * - `P`, `B`, `C`, or `U` code classes
 */
export const OBDiiRegex = /(?:^|\s)([PBCU][0-3][0-9]{3})/gi;

/**
 * Profile Link
 *
 * Matches:
 * - Better VINwiki `/profile/:uuid`
 * - VINwiki `/#/person/:uuid`
 */
export const ProfileLinkRegex =
  /(?:https?:\/\/[^\s]+\/(?:profile|person)\/)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g;

/**
 * Vehicle Link
 *
 * Matches:
 * - Better VINwiki `/vehicle/:vin`
 * - VINwiki `/#/vin/:vin`
 */
export const VehicleLinkRegex = /(?:https?:\/\/[^\s]+\/(?:vehicle|vin)\/)([A-HJ-NPR-Z0-9]{17})/g;

/**
 * List Link
 *
 * Matches:
 * - Better VINwiki `/list/:uuid`
 * - VINwiki `/#/lists/:uuid`
 */
export const ListLinkRegex =
  /(?:https?:\/\/[^\s]+\/(?:lists?)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))/g;
