import { writable, derived } from 'svelte/store';
import en from './en.json';
import ar from './ar.json';

type Translations = typeof en;
type Lang = 'en' | 'ar';

const translations: Record<Lang, Translations> = { en, ar };

function getInitialLang(): Lang {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem('vazix_lang') as Lang;
		if (stored === 'en' || stored === 'ar') return stored;
	}
	if (typeof navigator !== 'undefined') {
		const browserLang = navigator.language.slice(0, 2);
		if (browserLang === 'ar') return 'ar';
	}
	return 'en';
}

export const lang = writable<Lang>('en');

export function setLang(l: Lang) {
	lang.set(l);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('vazix_lang', l);
	}
	if (typeof document !== 'undefined') {
		document.documentElement.lang = l;
		document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
	}
}

export function initLang() {
	const initial = getInitialLang();
	setLang(initial);
}

export const t = derived(lang, ($lang) => {
	const dict = translations[$lang];
	return function get(key: string, params?: Record<string, string | number>): string {
		const keys = key.split('.');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let value: any = dict;
		for (const k of keys) {
			value = value?.[k];
		}
		if (typeof value !== 'string') return key;
		if (params) {
			return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
		}
		return value;
	};
});

export const isRTL = derived(lang, ($lang) => $lang === 'ar');
