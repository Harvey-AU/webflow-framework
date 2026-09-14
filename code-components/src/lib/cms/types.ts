/**
 * The CMS port: what a query is allowed to assume about where content lives.
 *
 * A query takes a `CmsClient` and nothing else, so the content source is a
 * constructor argument rather than an import. Webflow is one implementation
 * (`createWebflowClient`); `createStaticClient` is another. Swapping in a third
 * means writing one adapter that returns `CmsRecord`s - no query and no
 * component changes.
 */

/**
 * One record, with its fields already flattened to plain JSON values.
 *
 * `fields` is deliberately loose: an adapter maps a source's own field shapes
 * onto strings, numbers, booleans and arrays of ids, and the readers in
 * `./fields` do the narrowing at the point of use. Reference fields hold bare
 * ids - resolving them is the query's job, because no CMS we care about expands
 * them for us.
 */
export type CmsRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type CmsClient = {
  /**
   * Every published record in a collection, by the collection's slug.
   *
   * Whole collections rather than a filtered request. Webflow's list endpoints
   * only filter on `name`, `slug` and the date fields - there is no server-side
   * filter on an arbitrary field, reference fields included - so a reverse
   * lookup ("every word tagged with this theme") is built in memory from the
   * child collection. `groupByTag` in catalog-join does that. Fine at this
   * size; past a few thousand records, cache the query's result.
   */
  records(collection: string): Promise<CmsRecord[]>;
};
