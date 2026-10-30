sed -i "1i import Preloader from '../components/Preloader.js';" src/pages/ProductDetail.tsx
sed -i '119,124c\
  if (loading) {\
    return <Preloader text="Extracting Notes..." />;\
  }' src/pages/ProductDetail.tsx
