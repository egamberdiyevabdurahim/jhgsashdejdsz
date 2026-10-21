import 'react'
// The designs set custom properties inline (style="--i: 0", the score ring's --off, the photo's --photo).
declare module 'react' {
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
}
