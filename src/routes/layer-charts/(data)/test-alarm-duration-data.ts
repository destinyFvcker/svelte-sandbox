export interface AlarmDuration {
	category: string;
	start: Date;
	end: Date;
	status: 'triggered' | 'warning' | 'release';
}

/**
 * 最终改进函数：生成指定数量的 AlarmDuration 数据，
 * 1. 保证同一 category 的事件在时间上是连续的（Start_N = End_{N-1}）。
 * 2. 保证相邻两个时间区间的 status 必须是交替的（报警 <-> 解除）。
 * @param count 要生成的条目数量
 * @returns AlarmDuration 数组
 */
function generateAlternatingStatusAlarmData(count: number): AlarmDuration[] {
	const data: AlarmDuration[] = [];
	const categories: string[] = [
		'CPU_Usage_P95',
		'Memory_Leak',
		'Disk_IOPS_High',
		'DB_Connection_Pool_Exhausted',
		'API_Gateway_Timeout',
		'Log_Error_Spike',
		'Queue_Length_Overload',
		'Certificate_Expiry',
		'Cache_Miss_Ratio_High',
		'Custom_Business_KPI_Drop'
	];
	// 明确定义两种报警状态
	const ALARM_STATUSES: Array<'triggered' | 'warning'> = ['triggered', 'warning'];

	const YEAR = 2025;
	const MONTH = 11; // 12月
	const DAY = 12;
	const DAY_START_TIME_MS = new Date(YEAR, MONTH, DAY, 0, 0, 0).getTime();

	// 追踪每个 category 的最新结束时间
	const lastEndTimeByCategory: Map<string, Date> = new Map();
	// 追踪每个 category 的最新状态 (初始化为 'release'，代表正常状态)
	const lastStatusByCategory: Map<string, AlarmDuration['status']> = new Map();

	for (const cat of categories) {
		lastEndTimeByCategory.set(cat, new Date(DAY_START_TIME_MS));
		// 初始化第一个状态为 'release' (正常状态)，以保证第一个事件是报警
		lastStatusByCategory.set(cat, 'release');
	}

	// --- 步骤 1: 随机分配要生成的总数到每个类别 (保持不变) ---
	const countsPerCategory: Map<string, number> = new Map();
	let remainingCount = count;
	const avgCount = Math.floor(count / categories.length);

	for (const cat of categories) {
		countsPerCategory.set(cat, avgCount);
		remainingCount -= avgCount;
	}

	while (remainingCount > 0) {
		const catIndex = Math.floor(Math.random() * categories.length);
		const cat = categories[catIndex];
		countsPerCategory.set(cat, (countsPerCategory.get(cat) || 0) + 1);
		remainingCount--;
	}
	// -------------------------------------------------------------------

	// --- 步骤 2: 开始生成数据 ---
	categories.forEach((category) => {
		const numEvents = countsPerCategory.get(category) || 0;
		let currentStartTime = lastEndTimeByCategory.get(category)!;
		let currentStatus = lastStatusByCategory.get(category)!;

		for (let i = 0; i < numEvents; i++) {
			let newStatus: AlarmDuration['status'];

			// 1. 强制状态交替逻辑：
			if (currentStatus === 'release') {
				// 如果上一个是 'release' (正常)，则下一个必须是 'triggered' 或 'warning' (随机选择一个报警状态)
				newStatus = ALARM_STATUSES[Math.floor(Math.random() * ALARM_STATUSES.length)];
			} else {
				// 如果上一个是 'triggered' 或 'warning' (报警中)，则下一个必须是 'release' (解除状态)
				newStatus = 'release';
			}

			// 2. 设置 Start 时间（连续性）
			const start = currentStartTime;

			if (start.getDate() !== DAY) {
				break;
			}

			// 3. 随机生成持续时间 (根据状态调整时长范围)
			let minDurationMs: number;
			let maxDurationMs: number;

			if (newStatus === 'release') {
				// 解除状态可以持续更长时间，模拟系统在一段时间内的正常运行
				minDurationMs = 2 * 60 * 1000; // 2 分钟
				maxDurationMs = 150 * 60 * 1000; // 2.5 小时
			} else {
				// 报警状态通常持续较短
				minDurationMs = 10 * 1000; // 10 秒
				maxDurationMs = 50 * 60 * 1000; // 50 分钟
			}

			const durationMs =
				Math.floor(Math.random() * (maxDurationMs - minDurationMs + 1)) + minDurationMs;
			const end = new Date(start.getTime() + durationMs);

			// 4. 检查结束时间是否还在当天 (截断逻辑)
			if (end.getDate() !== DAY) {
				const dayEnd = new Date(YEAR, MONTH, DAY, 23, 59, 59, 999);
				data.push({
					category,
					start,
					end: dayEnd,
					status: newStatus
				});
				break;
			}

			data.push({
				category,
				start,
				end,
				status: newStatus
			});

			// 5. 更新状态和时间
			currentStartTime = end;
			currentStatus = newStatus; // 更新当前 category 的状态
		}
	});

	// 最终按时间排序所有数据
	data.sort((a, b) => a.start.getTime() - b.start.getTime());

	console.log(`实际生成了 ${data.length} 条时间连续且状态交替的报警事件（包含 release 状态）。`);

	return data;
}

// 调用函数生成 350 条连续且状态交替的数据
export const alternatingAlarmDataList = generateAlternatingStatusAlarmData(350);
