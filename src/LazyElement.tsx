import React, {ReactElement} from "react"
import Observer from '@researchgate/react-intersection-observer'

const LOAD_TIMEOUT_DEFAULT_MS = 500
const UNLOAD_TIMEOUT_DEFAULT_MS = 3000

interface LazyBaseProps {
    timeout?:number
    loadTimeout?:number | null
    unloadTimeout?:number | null
    root?: string | Element | null
    rootMargin?: string
    disabled?: boolean
}

export abstract class LazyBase<S> extends React.Component<S & LazyBaseProps, any> {

    constructor(props:any) {
        super(props);
        this.state = {visible: false, timeout:0};
    }

    private _isMounted: boolean = false;
    protected get isMounted(): boolean {
        return this._isMounted;
    }

    private _handle = 0;

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
        if (this._handle) {
            clearInterval(this._handle)
        }
    }

    protected observerDisabled() : boolean {
        return !!this.props.disabled;
    }

    handleIntersection(event:IntersectionObserverEntry) {

        if (!this.isMounted) return

        //only make changes to state while on screen and not unloaded
        if (this._handle) {
            window.clearInterval(this._handle)
        }

        let period:any;

        if (event.isIntersecting) {
            period = this.props.loadTimeout !== undefined ? this.props.loadTimeout : LOAD_TIMEOUT_DEFAULT_MS
        } else {
            period = this.props.unloadTimeout !== undefined ? this.props.unloadTimeout : UNLOAD_TIMEOUT_DEFAULT_MS
        }

        if (period === 0) {
            if (this._isMounted) {
                this.setState({visible: event.isIntersecting})
            }
        } else {
            this._handle = window.setTimeout(() => {
                if (this.state.visible === event.isIntersecting) return
                if (this._isMounted) {
                    this.setState({visible: event.isIntersecting})
                }
            }, period)
        }
    }
}

type LazyElementProps = {
    className?:string
    placeholder?:() => ReactElement
    element:() => ReactElement
}

export class LazyElement extends LazyBase<LazyElementProps> {
    render() {
        if (this.observerDisabled()) {
            return <div className={this.props.className}> {this.props.element()} </div>
        } else return (
            <Observer root={this.props.root} rootMargin={this.props.rootMargin} onChange={(event:IntersectionObserverEntry) => this.handleIntersection(event)}>
                {this.state.visible && this.isMounted ? this.props.element()
                    : this.props.placeholder ? this.props.placeholder() : <div className={this.props.className} /> }
            </Observer>
        );
    }
}


