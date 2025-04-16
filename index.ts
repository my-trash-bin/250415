type TypeMap = Partial<Record<string, unknown>>;

type Group = Partial<Record<string, SomethingUnion>>;

type SomethingUnion = SomethingLeaf | SomethingGroup;
type SomethingLeaf = { type: "leaf"; name: string };
type SomethingGroup = { type: "group"; group: Group };

export type UnionToIntersection<T> = (
  T extends any ? (something: T) => any : never
) extends (something: infer I) => any
  ? I
  : never;

export type UnionAny<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends infer I
  ? I extends () => infer R
    ? R
    : never
  : never;

type GroupToMap<T extends Group, R extends TypeMap> = GroupToMapInternal<
  T,
  R
> extends [infer T extends Group, infer R extends TypeMap]
  ? [keyof T] extends [never]
    ? R
    : GroupToMap<T, R>
  : never;

type GroupToMapInternal<T extends Group, R extends TypeMap> = [
  keyof T
] extends [never]
  ? [{}, R]
  : UnionAny<keyof T> extends infer I extends keyof T
  ? [Exclude<T[I], undefined>] extends [never]
    ? [Omit<T, I>, R]
    : [Omit<T, I>, SomethingToMap<Exclude<T[I], undefined>, R>]
  : never;

type SomethingToMap<
  T extends SomethingUnion,
  R extends TypeMap
> = T extends SomethingLeaf
  ? T["name"] extends keyof R
    ? R
    : R & Record<T["name"], T>
  : T extends SomethingGroup
  ? GroupToMap<T["group"], R>
  : never;

type Result = GroupToMap<
  {
    a: { type: "leaf"; name: "A" };
    b: { type: "leaf"; name: "B" };
    c: { type: "group"; group: { a: { type: "leaf"; name: "C" } } };
  },
  {}
>;
