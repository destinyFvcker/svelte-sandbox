import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * 根据传入的模式（Pattern）格式化日期。
 * @param dateValue - Date 对象或时间戳。
 * @param formatPattern - 格式模式，如 'MM/DD', 'HH:MM:SS', 'YYYY-MM-DD'。
 * @returns 格式化后的字符串。
 */
export function formatDate(dateValue: Date | number, formatPattern: string): string {
	const date = new Date(dateValue);

	// 获取时间组件
	const YYYY = date.getFullYear();
	const MM = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
	const DD = String(date.getDate()).padStart(2, '0');
	const HH = String(date.getHours()).padStart(2, '0');
	const MI = String(date.getMinutes()).padStart(2, '0');
	const SS = String(date.getSeconds()).padStart(2, '0');

	// 定义月份简写（手动实现 toLocaleDateString 的部分功能）
	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	const shortMonth = monthNames[date.getMonth()];

	// 替换模式中的占位符
	let formattedString = formatPattern
		.replace('YYYY', String(YYYY))
		.replace('MM', MM)
		.replace('DD', DD)
		.replace('HH', HH)
		.replace('MI', MI)
		.replace('SS', SS)
		.replace('MMM', shortMonth); // 添加月份简写支持

	return formattedString;
}
