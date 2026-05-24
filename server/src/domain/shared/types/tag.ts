export type Tag = string;

export function createTag(value: string): Tag {
  return value.trim().toLowerCase();
}
