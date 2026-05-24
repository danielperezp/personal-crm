import { describe, it, expect } from 'vitest';
import { Entity } from '../../domain/shared/Entity.js';
import { ValueObject } from '../../domain/shared/ValueObject.js';

class TestVO extends ValueObject<{ x: number; y: number }> {
  static create(x: number, y: number) { return new TestVO({ x, y }); }
}

class TestEntity extends Entity<string> {
  static create(id: string) { return new TestEntity(id); }
}

describe('ValueObject', () => {
  it('equals same props', () => {
    expect(TestVO.create(1, 2).equals(TestVO.create(1, 2))).toBe(true);
  });
  it('not equals different props', () => {
    expect(TestVO.create(1, 2).equals(TestVO.create(1, 3))).toBe(false);
  });
});

describe('Entity', () => {
  it('equals same id', () => {
    expect(TestEntity.create('a').equals(TestEntity.create('a'))).toBe(true);
  });
  it('not equals different id', () => {
    expect(TestEntity.create('a').equals(TestEntity.create('b'))).toBe(false);
  });
});
