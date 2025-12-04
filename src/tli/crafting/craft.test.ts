import { expect, test, describe } from 'vitest'
import { craft } from './craft'

describe('craft', () => {
  test('crafts affix at 0% returns min value', () => {
    const affix = {
      craftableAffix: '+(17-24)% Cooldown Recovery Speed',
    }
    expect(craft(affix, 0)).toBe('+17% Cooldown Recovery Speed')
  })

  test('crafts affix at 100% returns max value', () => {
    const affix = {
      craftableAffix: '+(17-24)% Cooldown Recovery Speed',
    }
    expect(craft(affix, 100)).toBe('+24% Cooldown Recovery Speed')
  })

  test('crafts affix at 50% returns middle value (rounded)', () => {
    const affix = {
      craftableAffix: '+(17-24)% Cooldown Recovery Speed',
    }
    // 17 + (24-17) * 0.5 = 17 + 3.5 = 20.5 → rounds to 21
    expect(craft(affix, 50)).toBe('+21% Cooldown Recovery Speed')
  })

  test('crafts affix with multiple ranges', () => {
    const affix = {
      craftableAffix: 'Adds (47-49)- (272-274)Elemental Damage',
    }
    expect(craft(affix, 0)).toBe('Adds 47- 272Elemental Damage')
    expect(craft(affix, 100)).toBe('Adds 49- 274Elemental Damage')
  })

  test('crafts affix with no ranges', () => {
    const affix = {
      craftableAffix: 'Has Hasten',
    }
    expect(craft(affix, 50)).toBe('Has Hasten')
  })

  test('crafts affix with negative ranges', () => {
    const affix = {
      craftableAffix: '(-6--4)% additional Physical Damage taken',
    }
    expect(craft(affix, 0)).toBe('-6% additional Physical Damage taken')
    expect(craft(affix, 100)).toBe('-4% additional Physical Damage taken')
  })

  test('crafts multi-effect affix with newline', () => {
    const affix = {
      craftableAffix: '+(5-7)% Armor Pen<>+(5-7)% Armor Pen for Minions',
    }
    expect(craft(affix, 0)).toBe('+5% Armor Pen<>+5% Armor Pen for Minions')
    expect(craft(affix, 100)).toBe('+7% Armor Pen<>+7% Armor Pen for Minions')
  })

  test('throws error for percentage < 0', () => {
    const affix = {
      craftableAffix: '+(17-24)% Speed',
    }
    expect(() => craft(affix, -1)).toThrow('Percentage must be 0-100')
  })

  test('throws error for percentage > 100', () => {
    const affix = {
      craftableAffix: '+(17-24)% Speed',
    }
    expect(() => craft(affix, 101)).toThrow('Percentage must be 0-100')
  })

  test('rounding edge case at 25%', () => {
    const affix = {
      craftableAffix: '+(10-20)% Speed',
    }
    // 10 + (20-10) * 0.25 = 10 + 2.5 = 12.5 → rounds to 13
    expect(craft(affix, 25)).toBe('+13% Speed')
  })

  test('rounding edge case at 75%', () => {
    const affix = {
      craftableAffix: '+(10-20)% Speed',
    }
    // 10 + (20-10) * 0.75 = 10 + 7.5 = 17.5 → rounds to 18
    expect(craft(affix, 75)).toBe('+18% Speed')
  })
})
