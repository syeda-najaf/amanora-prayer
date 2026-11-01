AMANORA UPI REDESIGN

Files:
- App.tsx: replace your existing src/App.tsx
- styles.css: replace your existing src/styles.css
- components/UpiPayment.tsx: place at src/components/UpiPayment.tsx
- components/UpiPayment.css: place at src/components/UpiPayment.css

The payment component is displayed inside the Me screen, below Settings.
Your configured UPI ID is retained as: syedaameenanajaf@naviaxis

IMPORTANT:
UPI intent and QR generation are implemented on the client. A successful app redirect or scan is NOT proof of payment.
This frontend cannot verify a transaction or automatically activate a paid membership. For that, connect a payment provider/backend and verify the payment server-side.
