import * as React from 'react';

import { targetCallbackMap } from './maps';
import { getOrCreateIO } from './utils';

// NOTE(apapirovski): The IO polyfill currently references window at the top scope
// and crashes in Node, hence we have to only require it on the client.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('intersection-observer');
}

type Ref = (element: Element) => void;

export interface IntersectionObserverRenderProps {
  setRef: Ref;
  didIntersect: boolean;
}

interface Props {
  offset?: string;
  once?: boolean;
  onIntersect?: () => void;
  render: (props: IntersectionObserverRenderProps) => React.ReactNode;
}

interface State {
  didIntersect: boolean;
}

class IntersectionObserverComponent extends React.Component<Props, State> {
  static defaultProps = {
    offset: '50%',
    onIntersect: () => {},
    once: true,
  }

  state: State = {
    didIntersect: false,
  };

  io: IntersectionObserver;

  ref: Element;

  getSnapshotBeforeUpdate({ offset: prevOffset }: Props) {
    // This has to happen in this lifecycle because we need to be able to clean up
    // the previously used IntersectionObserver instance and assign to the new one.
    // After the update, the `ref` could also change and we would then leak memory.
    if (!this.state.didIntersect && this.ref && this.props.offset !== prevOffset) {
      this.removeFromObserver();
      return this.ref;
    }

    return null;
  }

  componentDidUpdate(_prevProps: Props, _prevState: State, ref: HTMLElement | null) {
    if (ref && ref === this.ref) {
      this.io = getOrCreateIO(this.props.offset);
      this.addToObserver();
    }
  }

  componentWillUnmount() {
    this.removeFromObserver();
  }

  handleIntersect = (didIntersect: boolean) => {
    const { once, onIntersect } = this.props;
    const { didIntersect: hasIntersected } = this.state;

    if (!hasIntersected && didIntersect) {
      onIntersect();
      this.setState({ didIntersect: true });

      if (once) {
        this.removeFromObserver();
      }
    } else if (!didIntersect && hasIntersected) {
      this.setState({ didIntersect: false });
    }
  }

  addToObserver = () => {
    if (this.ref) {
      this.io.observe(this.ref);
      targetCallbackMap.set(this.ref, this.handleIntersect);
    }
  }

  removeFromObserver = () => {
    if (this.ref) {
      this.io.unobserve(this.ref);
      targetCallbackMap.delete(this.ref);
    }
  }

  setRef: Ref = (ref) => {
    this.io = getOrCreateIO(this.props.offset);
    this.removeFromObserver();

    this.ref = ref;
    if (!ref) {
      return;
    }

    this.addToObserver();
  }

  render() {
    return this.props.render({
      didIntersect: this.state.didIntersect,
      setRef: this.setRef,
    });
  }
}

export { Props };
export default IntersectionObserverComponent;
