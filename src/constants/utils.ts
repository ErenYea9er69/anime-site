export const SPONSOR_URL = '';
export const OPEN_NEW_ISSUE_URL = '';
export const EPISODES_INFO_URL = 'https://api.ani.zip/mappings?anilist_id=';
export const CONSUMET_API_URL = (
  process.env.NEXT_PUBLIC_CONSUMET_API_URL ||
  process.env.CONSUMET_API_URL ||
  'https://api.consumet.org'
).replace(/\/+$/, '');