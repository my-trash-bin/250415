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
  [R, T]
> extends infer I extends [TypeMap, Group]
  ? [keyof I[1]] extends [never]
    ? I[0]
    : GroupToMap<I[1], I[0]>
  : never;

type GroupToMapInternal<R extends [TypeMap, Group]> = [keyof R[1]] extends [
  never
]
  ? [R[0], {}]
  : UnionAny<keyof R[1]> extends infer I extends keyof R[1]
  ? [Exclude<R[1][I], undefined>] extends [never]
    ? [R[0], Omit<R[1], I>]
    : [SomethingToMap<Exclude<R[1][I], undefined>, R[0]>, Omit<R[1], I>]
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
