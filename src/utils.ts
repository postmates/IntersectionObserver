import { observerMap, targetCallbackMap } from './maps';

const handleIntersection: IntersectionObserverCallback = (entries) => {
  for (const entry of entries) {
    const handleIntersect = targetCallbackMap.get(entry.target);
    if (handleIntersect) {
      // Since IO runs off the main thread, it might technically be possible to
      // reach this after the entry has been unobserved and removed from the Map.
      handleIntersect(entry.isIntersecting);
    }
  }
};

export const getOrCreateIO = (offset: string) => {
  let io = observerMap.get(offset);
  if (!io) {
    io = new IntersectionObserver(handleIntersection, {
      rootMargin: offset,
      threshold: 0.01,
    });
    // NOTE(apapirovski): This is a setting that ignores DOM mutations in
    // polyfilled browsers. Can be removed once all target browsers support
    // IntersectionObserver properly.
    (io as any).USE_MUTATION_OBSERVER = false;
    observerMap.set(offset, io);
  }
  return io;
};
