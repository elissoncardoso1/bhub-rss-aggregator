declare module 'react-adsense' {
  import { Component } from 'react'

  interface GoogleAdSenseProps {
    client: string
    slot: string
    style?: React.CSSProperties
    format?: string
    responsive?: string
    layoutKey?: string
    layout?: string
    className?: string
  }

  export default class AdSense {
    static Google: React.ComponentType<GoogleAdSenseProps>
  }
}