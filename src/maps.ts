// To avoid creating an observer for each mounted IntersectionObserver instance,
// we keep a map of IO instances, as well as a map of the observed
// targets and their corresponding load callbacks. This means we
// also have to take great care to properly update these maps as
// these elements come in and out of the DOM.
export const observerMap = new Map<string, IntersectionObserver>();

type func = (didIntersect: boolean) => void;
export const targetCallbackMap = new Map<Element, func>();
