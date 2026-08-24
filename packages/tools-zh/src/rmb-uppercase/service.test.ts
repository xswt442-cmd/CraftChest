import { describe, expect, it } from 'vitest'
import { MAX_INTEGER_DIGITS, RmbFormatError, toRmbUppercase } from './service'

describe('toRmbUppercase · 基础映射', () => {
  it.each([
    ['0', '零元整'],
    ['1', '壹元整'],
    ['9', '玖元整'],
    ['10', '壹拾元整'],
    ['15', '壹拾伍元整'],
    ['110', '壹佰壹拾元整'],
    ['1234', '壹仟贰佰叁拾肆元整'],
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 组内与跨组零规则', () => {
  it.each([
    ['1001', '壹仟零壹元整'],
    ['1010', '壹仟零壹拾元整'],
    ['1050', '壹仟零伍拾元整'],
    ['10000', '壹万元整'],
    ['100001', '壹拾万零壹元整'],
    ['105000', '壹拾万伍仟元整'],
    ['100200', '壹拾万零贰佰元整'],
    ['1000000', '壹佰万元整'],
    ['1000000000', '壹拾亿元整'],
    ['1000000100', '壹拾亿零壹佰元整'],
    ['1234567890', '壹拾贰亿叁仟肆佰伍拾陆万柒仟捌佰玖拾元整'],
    // 中段整组为零：低位组非全零时补一个零
    ['1000000000001', '壹万亿零壹元整'],
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 角分与整', () => {
  it.each([
    ['1.05', '壹元零伍分'],
    ['1.5', '壹元伍角整'],
    ['1.50', '壹元伍角整'],
    ['1.55', '壹元伍角伍分'],
    ['12.34', '壹拾贰元叁角肆分'],
    ['0.02', '贰分'],
    ['0.2', '贰角整'],
    ['0.55', '伍角伍分'],
    ['1234567890.12', '壹拾贰亿叁仟肆佰伍拾陆万柒仟捌佰玖拾元壹角贰分'],
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 四舍五入到分', () => {
  it.each([
    ['1.005', '壹元零壹分'], // 第三位 5 进位
    ['1.004', '壹元整'], // 第三位 4 舍弃
    ['1.999', '贰元整'], // 分位进位波及整数
    ['9.995', '壹拾元整'], // 连环进位
    ['0.005', '壹分'],
    ['0.004', '零元整'],
    ['-0.001', '零元整'], // 舍入后为零，负号丢弃
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 零、负数与前导零', () => {
  it.each([
    ['-12.34', '负壹拾贰元叁角肆分'],
    ['-1', '负壹元整'],
    ['-0', '零元整'],
    ['007', '柒元整'],
    ['000', '零元整'],
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 容错清洗（￥ / 千分位 / 空白）', () => {
  it.each([
    ['￥1,234.56', '壹仟贰佰叁拾肆元伍角陆分'],
    ['¥ 12,000', '壹万贰仟元整'],
    [' 88.8 ', '捌拾捌元捌角整'],
  ])('%s → %s', (input, expected) => {
    expect(toRmbUppercase(input)).toBe(expected)
  })
})

describe('toRmbUppercase · 精度上限（16 位整数，字符串运算不走 float）', () => {
  const max16 = '9999999999999999' // Number.MAX_SAFE_INTEGER 只有约 16 位但已不安全
  it(`${max16} 正确转换`, () => {
    expect(toRmbUppercase(max16)).toBe(
      '玖仟玖佰玖拾玖万亿玖仟玖佰玖拾玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖元整',
    )
  })

  it(`超过 ${MAX_INTEGER_DIGITS} 位抛 range 错误`, () => {
    expect(() => toRmbUppercase('1' + '0'.repeat(MAX_INTEGER_DIGITS))).toThrowError(
      RmbFormatError,
    )
    try {
      toRmbUppercase('1' + '0'.repeat(MAX_INTEGER_DIGITS))
    } catch (err) {
      expect((err as RmbFormatError).code).toBe('range')
    }
  })

  it('超出 double 精度的金额不受浮点污染', () => {
    // 9007199254740993 = 2^53+1，float 会丢成 ...92；字符串运算必须保真
    expect(toRmbUppercase('9007199254740993')).toBe(
      '玖仟零柒万亿壹仟玖佰玖拾贰亿伍仟肆佰柒拾肆万零玖佰玖拾叁元整',
    )
  })
})

describe('toRmbUppercase · 非法输入', () => {
  it.each([
    '',
    '   ',
    'abc',
    '12.3.4',
    '5.',
    '.',
    '1e5',
    '--5',
    '+-5',
    '１２３', // 全角数字不接受
    '12a34',
  ])('%j 拒绝为 format 错误', (input) => {
    expect(() => toRmbUppercase(input)).toThrowError(RmbFormatError)
    try {
      toRmbUppercase(input)
    } catch (err) {
      expect((err as RmbFormatError).code).toBe('format')
    }
  })

  it('千分位下划线等清洗字符不影响数值', () => {
    expect(toRmbUppercase('1_234')).toBe('壹仟贰佰叁拾肆元整')
  })
})
