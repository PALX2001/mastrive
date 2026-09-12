// Singleton Razorpay script loader for high-performance concurrent script injection
let razorpayPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as any).Razorpay) return Promise.resolve(true)
  if (razorpayPromise) return razorpayPromise

  razorpayPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]')
    if (existingScript) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      razorpayPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return razorpayPromise
}

