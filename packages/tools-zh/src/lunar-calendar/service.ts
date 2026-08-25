/**
 * 农历公历互查 —— 纯函数逻辑层，封装 lunar-typescript。
 * 口径说明：干支年与生肖取库默认（以农历正月初一为界），
 * 故 2025-01-29（乙巳年春节）落在乙巳而非立春界的甲辰。
 */
import { Lunar, Solar } from 'lunar-typescript'

export interface JieQiEntry {
  /** 节气名，如 立春 */
  name: string
  /** 公历日期 YYYY-MM-DD */
  iso: string
}

export interface LunarInfo {
  /** 输入公历 YYYY-MM-DD */
  iso: string
  /** 完整中文农历日期，如「二〇二四年正月初一」（闰月含「闰」前缀） */
  fullZh: string
  /** 干支年（正月初一界），如 甲辰 */
  yearGanZhi: string
  /** 生肖，如 龙 */
  yearShengXiao: string
  /** 农历月（含闰标记），如 正 / 闰二 */
  monthZh: string
  /** 农历日，如 初一 */
  dayZh: string
  /** 当天节气名，无则 null */
  jieQi: string | null
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

function parseIso(iso: string): { y: number; m: number; d: number } {
  if (!ISO_RE.test(iso)) throw new RangeError(`非法日期：${iso}`)
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  const probe = new Date(Date.UTC(y, m - 1, d))
  if (
    !Number.isFinite(probe.getTime()) ||
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    throw new RangeError(`不存在该公历日期：${iso}`)
  }
  return { y, m, d }
}

/** 用正午构造 Solar，规避任何时区下的日界漂移 */
function noonSolar(y: number, m: number, d: number): Solar {
  return Solar.fromYmdHms(y, m, d, 12, 0, 0)
}

/** 中文节气名（表内另混有下一年度的英文枚举键，需过滤） */
const CN_TERM_NAME = /^[\u4e00-\u9fa5]{2}$/

function jieQiTableOf(lunar: Lunar): JieQiEntry[] {
  // getJieQiTable() 返回 { 名称: Solar } 对象而非数组（lunar-typescript 1.x 实测）
  return Object.entries(lunar.getJieQiTable())
    .filter(([name]) => CN_TERM_NAME.test(name))
    .map(([name, solar]) => ({ name, iso: solar.toYmd() }))
    .sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0))
}

/** 公历 → 农历信息；iso 形如 YYYY-MM-DD，非法抛 RangeError */
export function solarToLunar(iso: string): LunarInfo {
  const { y, m, d } = parseIso(iso)
  const lunar = noonSolar(y, m, d).getLunar()
  const monthZh = lunar.getMonthInChinese()
  const dayZh = lunar.getDayInChinese()

  return {
    iso,
    fullZh: `${lunar.getYearInChinese()}年${monthZh}月${dayZh}`,
    yearGanZhi: lunar.getYearInGanZhi(),
    yearShengXiao: lunar.getYearShengXiao(),
    monthZh,
    dayZh,
    jieQi: yearJieQiTable(iso).find((e) => e.iso === iso)?.name ?? null,
  }
}

/** 农历 → 公历；leap=true 表示闰该月。超范围抛 RangeError */
export function lunarToSolar(y: number, m: number, d: number, leap: boolean): string {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    throw new RangeError('年月日必须为整数')
  }
  try {
    const lunar = Lunar.fromYmdHms(y, leap ? -m : m, d, 12, 0, 0)
    return lunar.getSolar().toYmd()
  } catch {
    throw new RangeError(`不存在的农历日期：${leap ? '闰' : ''}${y}年${m}月${d}日`)
  }
}

/**
 * 某公历年内的全部节气（名称+日期升序）；iso 提供年份基准。
 * 单个农历年的节气表只覆盖「上年冬至→本年大雪」，故需并入次年农历年的表
 * （取次年 3/1 采样，必然已过春节进入新农历年）才能补齐当年 12 月下旬的节气。
 */
export function yearJieQiTable(iso: string): JieQiEntry[] {
  const { y } = parseIso(iso)
  const seen = new Map<string, JieQiEntry>()
  const samples: Array<[number, number, number]> = [
    [y, 1, 10],
    [y, 6, 1],
    [y + 1, 3, 1],
  ]
  for (const [sy, sm, sd] of samples) {
    for (const entry of jieQiTableOf(noonSolar(sy, sm, sd).getLunar())) {
      if (entry.iso.startsWith(String(y))) seen.set(`${entry.iso}#${entry.name}`, entry)
    }
  }
  return [...seen.values()]
}
