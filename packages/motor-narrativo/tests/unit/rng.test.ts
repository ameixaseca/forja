import { describe, expect, it } from 'vitest';

import { SeededRNG } from '../../src/rng';

describe('SeededRNG', () => {
  it('produces identical sequences from the same seed', () => {
    const first = new SeededRNG(42);
    const second = new SeededRNG(42);

    const firstSequence = Array.from({ length: 12 }, () => first.next());
    const secondSequence = Array.from({ length: 12 }, () => second.next());

    expect(firstSequence).toEqual(secondSequence);
  });

  it('produces different sequences from different seeds', () => {
    const first = new SeededRNG(42);
    const second = new SeededRNG(43);

    const firstSequence = Array.from({ length: 12 }, () => first.next());
    const secondSequence = Array.from({ length: 12 }, () => second.next());

    expect(firstSequence).not.toEqual(secondSequence);
  });

  it('chooses deterministically from independent instances with the same seed', () => {
    const first = new SeededRNG(100);
    const second = new SeededRNG(100);
    const options = ['a', 'b', 'c', 'd'];

    const firstChoices = Array.from({ length: 20 }, () => first.choice(options));
    const secondChoices = Array.from({ length: 20 }, () => second.choice(options));

    expect(firstChoices).toEqual(secondChoices);
  });

  it('returns inclusive integers within the requested range', () => {
    const rng = new SeededRNG(1234);

    const samples = Array.from({ length: 1_000 }, () => rng.nextInt(-3, 7));

    expect(samples.every((value) => value >= -3 && value <= 7)).toBe(true);
  });
});
