/**
 * 简繁转换 —— 纯函数逻辑层，封装 opencc-js。
 * 四个预设定型：字级简繁、台湾词汇、香港变体、繁→简；转换器惰性建单例缓存。
 */
import OpenCC from 'opencc-js'

export type OpenccPreset = 'cn2t' | 'cn2tw' | 'cn2hk' | 't2cn'

/** from/to 取值见 opencc-js 文档：cn=大陆简体；t/tw/hk=字形转换，twp/hkp=叠加地区词汇转换 */
const PRESET_LOCALES: Record<OpenccPreset, { from: string; to: string }> = {
  cn2t: { from: 'cn', to: 't' },
  cn2tw: { from: 'cn', to: 'twp' },
  cn2hk: { from: 'cn', to: 'hkp' },
  t2cn: { from: 't', to: 'cn' },
}

const converters = new Map<OpenccPreset, (text: string) => string>()

function getConverter(preset: OpenccPreset): (text: string) => string {
  let fn = converters.get(preset)
  if (fn === undefined) {
    const { from, to } = PRESET_LOCALES[preset]
    fn = OpenCC.Converter({ from, to })
    converters.set(preset, fn)
  }
  return fn
}

/** 按预设方向转换；空串原样返回，非中文字符不受影响 */
export function convertChinese(text: string, preset: OpenccPreset): string {
  if (text === '') return ''
  return getConverter(preset)(text)
}
