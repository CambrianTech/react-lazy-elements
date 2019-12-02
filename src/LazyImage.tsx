import React, {createRef, ReactElement} from "react"
import {LazyBase} from "./LazyElement";
import Observer from "@researchgate/react-intersection-observer";

type ImageSource = {
    src?:string
    srcSet?:string
}

const blankImageSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="

type LazyImageProps = {
    className?: string
    src?:string
    srcSet?:string
    alt?:string
    placeholderSrc?:string
    maintainSize?:boolean
    loadOnMount?:boolean
    getImageSource?:() => ImageSource
    placeholder?:() => ReactElement
}

export class LazyImage extends LazyBase<LazyImageProps> {

    private _imageElement = createRef<HTMLImageElement>()

    getImageSource() : ImageSource {
        if (this.props.getImageSource) {
            return this.props.getImageSource()
        }
        return {
            src:this.props.src,
            srcSet:this.props.srcSet,
        }
    }

    componentDidMount() {
        super.componentDidMount()

        if (this._imageElement.current) {
            if (this.props.src) {
                this._imageElement.current.src = this.props.loadOnMount ? this.props.src : blankImageSrc
            }
            if (this.props.srcSet) {
                this._imageElement.current.srcset = this.props.loadOnMount ? this.props.srcSet : blankImageSrc
            }
        }
    }

    componentWillUnmount() {
        if (this._imageElement.current) {
            this._imageElement.current.src = blankImageSrc
            this._imageElement.current.srcset = blankImageSrc
        }
        super.componentWillUnmount()
    }

    private maintainSize() {
        if (this._imageElement.current) {
            const element = this._imageElement.current
            element.onload = ()=>{
                const size = element.getBoundingClientRect()
                element.style.width = `${size.width}px`
                element.style.height = `${size.height}px`
            }
        }
    }

    protected get placeholderImageSrc(): string {
        return this.props.placeholderSrc ? this.props.placeholderSrc : blankImageSrc;
    }

    protected visibilityWillChange(visible:boolean):void {

        if (this._imageElement.current) {
            const newSrc = visible ? this.props.src : this.placeholderImageSrc
            if (this.props.src && newSrc && newSrc !== this._imageElement.current.src) {
                this._imageElement.current.src = newSrc
            }
            const newSrcSet = visible ? this.props.srcSet : this.placeholderImageSrc
            if (this.props.srcSet && newSrcSet && newSrcSet !== this._imageElement.current.srcset) {
                this._imageElement.current.srcset = newSrcSet
            }
        }

        if (visible && this.props.maintainSize) {
            this.maintainSize()
        }
    }

    render() {
        return <Observer root={this.props.root} rootMargin={this.props.rootMargin} onChange={(event:IntersectionObserverEntry) => this.handleIntersection(event)}>
            <img ref={this._imageElement} className={this.props.className} alt={this.props.alt} />
        </Observer>
    }
}

