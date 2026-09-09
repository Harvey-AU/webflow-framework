/**
 * Every CMS query, in one place.
 *
 * A query takes a `CmsClient` and returns the shape a component renders. It
 * knows the collection slugs and field names; the component it feeds knows
 * neither, and the client knows neither. Each is exposed to the page through a
 * Code Function in `src/webflow-functions`, which is a two-line wrapper.
 */
export { navQuery, type NavData } from "./nav";
export { catalogQuery } from "./catalog";
