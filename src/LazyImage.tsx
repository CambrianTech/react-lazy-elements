import React, {createRef, ReactElement} from "react"
import {LazyBase, LazyElement} from "./LazyElement";

type ImageSource = {
    src?:string
    srcSet?:string
}

export const blankImageSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="

type LazyImageProps = {
    className?: string
    src?:string
    srcSet?:string
    alt?:string
    placeholderSrc?:string
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

    componentWillUnmount() {
        if (this._imageElement.current) {
            this._imageElement.current.src = ""
            this._imageElement.current.srcset = ""
        }
        super.componentWillUnmount()
    }

    protected get placeholderImageSrc(): string {
        return this.props.placeholderSrc ? this.props.placeholderSrc : blankImageSrc;
    }

    private _timeout:any = 0
    setVisibility(show:boolean, timeout?:number|null) {
        if (!this._imageElement.current || !this.isMounted) return

        if (this._timeout) {
            clearInterval(this._timeout)
            this._timeout = 0
        }
        if (timeout) {
            this._timeout = setTimeout(()=> {
                this.setVisibility(show)
            }, timeout)
            return
        }

        const newSrc = show ? this.props.src : this.placeholderImageSrc
        if (this.props.src && newSrc && newSrc !== this._imageElement.current.src) {
            this._imageElement.current.src = newSrc
        }
        const newSrcSet = show ? this.props.srcSet : this.placeholderImageSrc
        if (this.props.srcSet && newSrcSet && newSrcSet !== this._imageElement.current.srcset) {
            this._imageElement.current.srcset = newSrcSet
        }
    }

    render() {

        return (
            <LazyElement timeout={this.props.timeout} loadTimeout={this.props.loadTimeout}
                         root={this.props.root} rootMargin={this.props.rootMargin}
                         element={() => {
                             this.setVisibility(true, this.props.loadTimeout)
                             return <img ref={this._imageElement} className={this.props.className}
                                         src={this.props.src ? this.placeholderImageSrc : undefined}
                                         srcSet={this.props.srcSet ? this.placeholderImageSrc : undefined} alt={this.props.alt} />}
                         }

                         placeholder={() => {
                             this.setVisibility(!!this.props.disabled, this.props.unloadTimeout)
                             return <img ref={this._imageElement} className={this.props.className}
                                         src={this.props.src ? this.placeholderImageSrc : undefined}
                                         srcSet={this.props.srcSet ? this.placeholderImageSrc : undefined} alt={this.props.alt} />}
                         }
            />
        )
    }
}

