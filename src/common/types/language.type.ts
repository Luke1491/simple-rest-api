export enum eLang {
  PL = 'pl',
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  JA = 'ja',
}

export type Lang = keyof typeof eLang;
