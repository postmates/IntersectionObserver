import * as React from 'react';
import { mount as originalMount } from 'enzyme';

import { observerMap, targetCallbackMap } from '../src/maps';
import IntersectionObserver, { IntersectionObserverRenderProps } from '../src/index';

describe('IntersectionObserver', () => {
  let mounted: any[] = [];
  let cleanup: Function;

  const mount: typeof originalMount = (node: React.ReactElement<any>) => {
    const m = originalMount(node);
    mounted.push(m);
    return m;
  };

  beforeEach(() => {
    if (mounted.length) {
      mounted.forEach((m) => m.unmount());
      mounted = [];
    }

    if (cleanup) {
      cleanup();
    }
  });

  it('accepts an offset', () => {
    const comp = mount<IntersectionObserver, {}, {}>(
      <IntersectionObserver
        offset="0px 50px"
        render={({ setRef }) => <div ref={setRef} />}
      />,
    );
    cleanup = () => observerMap.delete('0px 50px');
    expect(comp.instance().io.rootMargin).toBe('0px 50px 0px 50px');
  });

  it('is able to gracefully handle offset prop changing', () => {
    const comp = mount(<IntersectionObserver render={({ setRef }) => <div ref={setRef} />} />);
    expect(observerMap.size).toBe(1);

    comp.setProps({ offset: '0px 50px' });
    expect(observerMap.size).toBe(2);
    expect(targetCallbackMap.size).toBe(1);
  });

  it('stops tracking after the condition is met if once is true', () => {
    const comp = mount<IntersectionObserver, {}, {}>(
      <IntersectionObserver
        render={({ setRef }) => <div ref={setRef} />}
        once
      />,
    );
    expect(observerMap.size).toBe(1);
    expect(targetCallbackMap.size).toBe(1);

    const instance = comp.instance();
    instance.handleIntersect(true);

    expect(observerMap.size).toBe(1);
    expect(targetCallbackMap.size).toBe(0);
  });

  it('keeps tracking after the condition is met if once is false', () => {
    const comp = mount<IntersectionObserver, {}, {}>(
      <IntersectionObserver
        render={({ setRef }) => <div ref={setRef} />}
        once={false}
      />,
    );
    expect(observerMap.size).toBe(1);
    expect(targetCallbackMap.size).toBe(1);

    const instance = comp.instance();
    instance.handleIntersect(true);

    expect(observerMap.size).toBe(1);
    expect(targetCallbackMap.size).toBe(1);
  });

  it('toggles state if it stops intersecting', () => {
    const comp = mount<IntersectionObserver, {}, { didIntersect: boolean }>(
      <IntersectionObserver
        render={({ setRef }) => <div ref={setRef} />}
        once={false}
      />,
    );

    const instance = comp.instance();
    instance.handleIntersect(true);

    expect(comp.state().didIntersect).toBe(true);

    instance.handleIntersect(false);

    expect(comp.state().didIntersect).toBe(false);
  });

  it('gracefully switches refs', () => {
    let storedRef;
    const comp = mount<IntersectionObserver, {}, {}>(
      <IntersectionObserver
        render={({ setRef }) => (
          <span
            ref={(ref) => {
              setRef(ref);
              storedRef = ref;
            }}
          />
        )}
      />,
    );

    expect(comp.instance().ref).toBe(storedRef);
    expect(targetCallbackMap.get(storedRef)).not.toBe(undefined);

    let storedRef2;
    comp.setProps({
      render: ({ setRef }: IntersectionObserverRenderProps) => (
        <div
          ref={(ref) => {
            setRef(ref);
            storedRef2 = ref;
          }}
        />
      ),
    });

    expect(storedRef2).not.toBe(storedRef);
    expect(comp.instance().ref).toBe(storedRef2);
    expect(targetCallbackMap.get(storedRef)).toBe(undefined);
    expect(targetCallbackMap.get(storedRef2)).not.toBe(undefined);
  });

  it('gracefully switches refs and offsets', () => {
    const comp = mount<IntersectionObserver, {}, {}>(<IntersectionObserver
      render={({ setRef }) => (
        <span ref={setRef} />
      )}
    />);
    expect(observerMap.size).toBe(1);

    comp.setProps({
      offset: '0px 50px',
      render: ({ setRef }: IntersectionObserverRenderProps) => <div ref={setRef} />,
    });
    expect(observerMap.size).toBe(2);
    expect(targetCallbackMap.size).toBe(1);
  });

  it('cleans up after unmount', () => {
    const comp = mount<IntersectionObserver, {}, {}>(
      <IntersectionObserver render={({ setRef }) => <div ref={setRef} />} />,
    );
    const instance = comp.instance();
    comp.unmount();

    expect(instance.ref).toBe(null);
    expect(observerMap.size).toBe(1);
    expect(targetCallbackMap.size).toBe(0);
  });
});
