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
    visibilityWillChange?:(visible:boolean)=>void
}

export abstract class LazyBase<S> extends React.Component<S & LazyBaseProps, any> {

    protected get isVisible():boolean {
        if (this.isMounted) {
            return this.state.visible
        }
        return false
    }

    protected set isVisible(visible:boolean) {
        if (this.isMounted) {
            this.visibilityWillChange(visible)
            this.setState({visible: visible});
        }
    }

    protected visibilityWillChange(visible:boolean):void {
        if (this.props.visibilityWillChange) {
            this.props.visibilityWillChange(visible)
        }
    }

    private _isMounted: boolean = false;
    protected get isMounted(): boolean {
        return this._isMounted;
    }

    private _handle = 0;

    componentDidMount() {
        this.setState({visible: false});
        this._isMounted = true
    }

    componentWillUnmount() {
        this.visibilityWillChange(false)
        this._isMounted = false
        if (this._handle) {
            clearInterval(this._handle)
        }
    }

    protected observerDisabled() : boolean {
        return !!this.props.disabled;
    }

    protected handleIntersection(event:IntersectionObserverEntry) {

        if (!this.isMounted) return

        //only make changes to state while on screen and not unloaded
        if (this._handle) {
            window.clearInterval(this._handle)
        }

        let period:any

        if (event.isIntersecting) {
            period = this.props.loadTimeout !== undefined ? this.props.loadTimeout : LOAD_TIMEOUT_DEFAULT_MS
        } else {
            period = this.props.unloadTimeout !== undefined ? this.props.unloadTimeout : UNLOAD_TIMEOUT_DEFAULT_MS
        }

        if (period === 0) {
            this.isVisible = event.isIntersecting
        } else {
            this._handle = window.setTimeout(() => {
                if (this.isVisible === event.isIntersecting) return
                this.isVisible = event.isIntersecting
            }, period)
        }
    }
}

type LazyElementProps = {
    className?:string
    placeholder?:() => ReactElement
    children?:React.ReactElement<any> | null | undefined
}

export class LazyElement extends LazyBase<LazyElementProps> {
    render() {
        if (this.observerDisabled()) {
            return this.props.children
        } else return (
            <Observer root={this.props.root} rootMargin={this.props.rootMargin} onChange={(event:IntersectionObserverEntry) => this.handleIntersection(event)}>
                {this.isVisible ? this.props.children
                    : this.props.placeholder ? this.props.placeholder() : <div className={this.props.className} /> }
            </Observer>
        );
    }
}


