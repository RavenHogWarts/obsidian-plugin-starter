import { getLanguage } from "obsidian";
import type { Locales, TranslationFunctions } from "./i18n-types";
import { baseLocale, i18nObject, isLocale, loadedLocales } from "./i18n-util";
import { loadAllLocales } from "./i18n-util.sync";

/**
 * 递归生成所有嵌套键的点分隔路径类型
 * 例如: { common: { confirm: () => string } } => 'common' | 'common.confirm'
 */
type DeepKeys<T, Prefix extends string = ""> = T extends (
	...args: unknown[]
) => unknown
	? Prefix
	: T extends object
	? {
			[K in keyof T & string]: K extends string
				? DeepKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
				: never;
	  }[keyof T & string]
	: Prefix;

/**
 * 通过点分隔路径获取嵌套对象的值类型
 */
type DeepValue<
	T,
	Path extends string
> = Path extends `${infer First}.${infer Rest}`
	? First extends keyof T
		? DeepValue<T[First], Rest>
		: never
	: Path extends keyof T
	? T[Path]
	: never;

/**
 * 获取所有叶子节点（翻译函数）的路径
 */
type TranslationKeys = DeepKeys<TranslationFunctions>;

/**
 * I18n 管理类
 * 基于 typesafe-i18n 的封装，提供类型安全的国际化支持
 */
export class I18n {
	private static instance: I18n;
	private currentLocale: Locales;
	private LL: TranslationFunctions;

	private constructor() {
		// 加载所有语言包（同步方式）
		loadAllLocales();

		// 获取 Obsidian 当前语言设置
		const obsidianLang = getLanguage();

		// 确定使用的 locale：如果 Obsidian 语言在支持列表中则使用，否则回退到基础语言
		this.currentLocale = isLocale(obsidianLang) ? obsidianLang : baseLocale;

		// 初始化翻译函数对象
		this.LL = i18nObject(this.currentLocale);
	}

	/**
	 * 获取 I18n 单例
	 */
	public static getInstance(): I18n {
		if (!I18n.instance) {
			I18n.instance = new I18n();
		}
		return I18n.instance;
	}

	/**
	 * 获取翻译函数对象
	 * 可通过 LL.common.confirm() 的方式调用
	 */
	public get L(): TranslationFunctions {
		return this.LL;
	}

	/**
	 * 获取当前 locale
	 */
	public getLocale(): Locales {
		return this.currentLocale;
	}

	/**
	 * 检查某个 locale 是否已加载
	 */
	public isLocaleLoaded(locale: Locales): boolean {
		return !!loadedLocales[locale];
	}
}

// 导出默认实例
export const i18n = I18n.getInstance();

const LL = i18n.L;

/**
 * 通过点分隔路径获取嵌套对象的值
 */
function getNestedValue(obj: unknown, path: string): unknown {
	return path.split(".").reduce((current, key) => {
		if (current && typeof current === "object" && key in current) {
			return (current as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

/**
 * 便捷的 t 翻译函数
 * 支持嵌套路径访问，例如: t('common.confirm'), t('setting.tabs.renderer')
 *
 * @param key 点分隔的翻译键路径
 * @param args 翻译函数的参数（如果有）
 * @returns 翻译后的字符串
 *
 * @example
 * t('common.confirm')  // => "确定"
 * t('notice.create_file_success', { path: '/path/to/file' })  // => "文件创建成功，/path/to/file"
 */
export const t = <K extends TranslationKeys>(
	key: K,
	...args: DeepValue<TranslationFunctions, K> extends (
		...a: infer P
	) => unknown
		? P
		: never
): string => {
	const fn = getNestedValue(LL, key);
	if (typeof fn === "function") {
		return fn(...args) as string;
	}
	console.warn(
		`[i18n] Translation key "${key}" not found or is not a function`
	);
	return key;
};
