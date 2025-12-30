from datetime import datetime
from collections import Counter

# ====== 配置 ======
file_path = "data.txt"          # 替换为你的文件路径
time_format = "%Y/%m/%d %H:%M"
target_year = 2025
# ==================

month_counter = Counter()

with open(file_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue

        try:
            dt = datetime.strptime(line, time_format)

            if dt.year == target_year:
                month_key = f"{dt.year}-{dt.month:02d}"  # 例如 2025-01
                month_counter[month_key] += 1

        except ValueError:
            # 跳过非法行
            continue

# ====== 输出统计结果 ======
if month_counter:
    most_common_month, count = month_counter.most_common(1)[0]
    print(f"2025 年出现频次最多的月份是：{most_common_month}")
    print(f"出现次数：{count}")
else:
    print("未找到 2025 年的数据。")
